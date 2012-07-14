# -*- coding: utf-8 -*-
"""
    Pixl
    ~~~~~~

    A microblog.
    
    Heavy client.
    
    Mongo.

    :copyright: (c) 2012 by Ryo Chiba.
    :license: BSD, see LICENSE for more details.
"""
from __future__ import with_statement
from contextlib import closing
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash
from pymongo import Connection
import hashlib
import json
import os
import time

from urlparse import urlparse
     
# configuration
DATABASE = 'pixlDB'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)
app.secret_key = os.urandom(24)

def connect_db():
    """Returns a new connection to the database."""
    #url = urlparse(os.environ['MONGOHQ_URL'])
    url = urlparse('mongodb://heroku:cb9a2022a1f1ab178a9be5f3be3269d4@staff.mongohq.com:10063/app5886932')
    connection = Connection(url.hostname, url.port)
    db = connection[url.path[1:]]
    db.authenticate(url.username, url.password)
    return db


def init_db():
    """Creates the database tables."""
    # Insert the admin user into the mongo collection
    connection = Connection()
    db = connection['pixlDB']
    a = {}
    a.username = USERNAME
    a.password = hashlib.sha224(PASSWORD).hexdigest()
    a.email = 'ryochiba@gmail.com'
    db.users.insert()

    p = {}
    p.owner = USERNAME
    p.name = 'Blog'
    p.description = 'a description'
    p.privacy = 'p'
    p.bgImage = ''
    db.pages.insert(p)
    
    e = {}
    e.owner = USERNAME
    e.page = 'Blog'
    e.id = '123abc'
    e.contents = 'Hello World'
    e.top = '100'
    e.left = '200'
    e.width = '321'
    e.height = '123'
    e.type = 'box'
    db.elements.insert(e)

@app.before_request
def before_request():
    """Make sure we are connected to the database each request."""
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    """Closes the database again at the end of the request."""
    # if hasattr(g, 'db'):
        # g.db.end_request()


@app.route('/')
def show_pages():
    if not session.get('logged_in'):
        flash('Please Log In')
        return redirect(url_for('login'))
    pageCurs = g.db.pages.find({'owner':session.get('username')})
    pages = [] 
    for page in pageCurs: 
           pages.append(page)
    return render_template('show_pages.html', pages=pages)

@app.route('/<username>/<pagetitle>.json')
def show_page_json(username, pagetitle):
    # gets all of the elements for a given page and sends it back as json
    # that can be used by the app
    page = g.db.pages.find_one({'owner':username, 'title':pagetitle})
    if page is None:
        print 'Page is none!'
        abort(404)
    if page.get('privacy', '') == 'p' and session.get('username') != username:
        print 'Privacy violation!'
        abort(404)
    res = page
    res['boxes'] = []
    res['lastUpdated'] = page.get('lastUpdated','-1') # get lastUpdated timestamp
    res.pop('_id') # this allows the obj to be json serialized
    elementCurs = g.db.elements.find({'owner':username, 'page':pagetitle})
    for element in elementCurs:
        element.pop('_id')
        res['boxes'].append(element)
    
    return json.dumps(res)
    
    
# front end calls this when we want to save the elements
'''
expects: {boxes:[boxObjs]}

'''
@app.route('/<username>/<pagetitle>/save', methods=['POST'])
def save_page(username, pagetitle):
    if not session.get('logged_in'):
        print 'not logged in'
        abort(401)
    if session.get('username') != username:
        print 'username is an issue %s %s' % (session.get('username'), username)
        abort(401)
    page = g.db.pages.find_one({'owner':username, 'title': pagetitle})
    if page is None:
        return "Page does not exist."
    
    print request
    data = json.loads(request.data) # turns request json string into dict
    boxes = data['boxes']
    
    for box in boxes:
        box['owner'] = username
        box['page'] = pagetitle
        key = {'id':box['id']}
        g.db.elements.update(key, box, True); # update if box of this id exists
    
    # once all insertion is complete, then update the timestamp for the page (in milliseconds)
    page['lastUpdated'] = int(time.time()*1000)
    page['bgImage'] = data.get('bgImage','')
    g.db.pages.save(page)
    
    return "success"
    
@app.route('/<username>/<pagetitle>', methods=['GET', 'POST'])
def show_page(username, pagetitle):
    page = g.db.pages.find_one({'owner':username, 'title': pagetitle})
    if page is None:
        abort(404)
    if page.get('privacy', '') == 'p' and session.get('username') != username:
        abort(401)
    return render_template('page.html', page=page)
   
@app.route('/addpage', methods=['POST'])
def add_page():
    if not session.get('logged_in'):
        abort(401)
    if g.db.pages.find({'owner':session.get('username'),'title':request.form['title']}).count() > 0:
        flash('Page with same title exists!')
        return redirect(url_for('show_pages'))
    g.db.pages.insert({'owner':session.get('username'),'title':request.form['title'], 'description':request.form['description']})
    flash('New page was successfully created')
    return redirect(url_for('show_pages'))

@app.route('/removepage', methods=['POST'])
def remove_page():
    if not session.get('logged_in'):
        abort(401)
    data = json.loads(request.data) 
    print data
    g.db.pages.remove({'owner':session.get('username'),'title':data['title']})
    flash('Page was successfully removed')
    return redirect(url_for('show_pages'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        user = g.db.users.find_one({'username':request.form['username'],'password':hashlib.sha224(request.form['password']).hexdigest()})
        if user is None:
            error = 'Invalid username or password'
        else:
            session['logged_in'] = True
            session['username'] = request.form['username']
            flash('You were logged in')
            return redirect(url_for('show_pages'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_pages'))


@app.route('/adduser', methods=['GET', 'POST'])
def add_user():
    if request.method == 'POST':
        g.db.users.insert({'username':request.form['username'], 'password':hashlib.sha224(request.form['password']).hexdigest(), 'email':request.form['email'] })
        session['logged_in'] = True
        session['username'] = request.form['username']
        return redirect(url_for('show_pages'))
    flash('Welcome to Pixl')
    return render_template('adduser.html')
  
  





  
if __name__ == '__main__':
    app.run()
