from config import app, db, api
from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import Librarian, Book
from datetime import timedelta


class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']

        if not username or not password:
            return {'message': 'Missing username or password'}, 400
        
        user = Librarian.query.filter(Librarian.username == username).first()

        if not user or not user.verify_password(password):
            return {'message': 'Invalid username or password'}, 401
        
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=10))
        return{'access_token': access_token}, 200
    

class BooksResource(Resource):
    @jwt_required()
    def get(self, book_id=None):
        if book_id:
            book = Book.query.get(book_id)
            if not book:
                return {'message': 'Book not found'}, 404
            return {
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'isbn': book.isbn,
                'quantity': book.quantity,
            }, 200
        else:
            books = Book.query.all()
            return [{'id': book.id, 'title': book.title, 'author': book.author, 'isbn': book.isbn, 'quantity': book.quantity } for book in books], 200
            

api.add_resource(BooksResource, '/books', '/books/<int:book_id>')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)