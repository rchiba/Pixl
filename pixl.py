# -*- coding: utf-8 -*-
"""
    Pixl
    ~~~~~~

    A microblog.

    :copyright: (c) 2012 by Ryo Chiba.
    :license: BSD, see LICENSE for more details.
"""
from __future__ import with_statement
from contextlib import closing
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash
from pymongo import Connection
import hashlib
     
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


def connect_db():
    """Returns a new connection to the database."""
    connection = Connection()
    db = connection['pixlDB']
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
    pageCurs = g.db.pages.find({'owner':USERNAME})
    pages = [] 
    for page in pageCurs: 
           pages.append(page)
    return render_template('show_pages.html', pages=pages)


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
    print request.data
    #g.db.pages.remove({'owner':session.get('username'),'title':request.form['title']})
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
        g.db.users.insert({'username':USERNAME,'name':request.form['username'], 'password':hashlib.sha224(request.form['password']).hexdigest(), 'email':request.form['email'] })
        session['logged_in'] = True
        session['username'] = request.form['username']
        return redirect(url_for('show_pages'))
    flash('Welcome to Pixl')
    return render_template('adduser.html')
    
if __name__ == '__main__':
    app.run()
