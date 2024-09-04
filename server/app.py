from config import app, db, api
from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import Librarian, Book, Member, Transaction
from datetime import timedelta, datetime


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
                'created_at': book.created_at.strftime('%Y-%m-%d'),
                'updated_at': book.updated_at.strftime('%Y-%m-%d')
            }, 200
        else:
            books = Book.query.all()
            return [{'id': book.id, 'title': book.title, 'author': book.author, 'isbn': book.isbn, 'quantity': book.quantity } for book in books], 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        new_book = Book(
            title=data['title'],
            author=data['author'],
            isbn=data['isbn'],
            quantity=data.get('quantity', 0)
        )
        db.session.add(new_book)
        db.session.commit()
        return {'message': 'Book created', 'id': new_book.id}, 201
    
    @jwt_required()
    def put(self, book_id):
        book = Book.query.get(book_id)
        if not book:
            return {'message': 'Book not found'}, 404
        
        data = request.get_json()
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.isbn = data.get('isbn', book.isbn)
        book.quantity = data.get('quantity', book.quantity)

        db.session.commit()
        return {'message': "Book updated successfully"}, 201
    
    @jwt_required()
    def delete(self, book_id):
        book = Book.query.get(book_id)
        if not book:
            return {'message': 'Book not found'}, 404
        
        db.session.delete(book)
        db.session.commit()
        return {'message': 'Book deleted successfully'}, 200
    
class MembersResource(Resource):
    @jwt_required()
    def get(self, member_id=None):
        if member_id:
            member = Member.query.get(member_id)
            if not member:
                return {'message': 'Member not found'}, 404
            return {
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'phone': member.phone,
                'outstanding_debt': member.outstanding_debt,
                'created_at': member.created_at.strftime('%Y-%m-%d'),
                'updated_at': member.updated_at.strftime('%Y-%m-%d')
            }, 200
        else:
            members = Member.query.all()
            return [{'id': member.id, 'name': member.name, 'email': member.email, 'phone': member.phone, 'outstanding_debt': member.outstanding_debt} for member in members], 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        new_member = Member(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            outstanding_debt=data.get('outstanding_debt', 0.0)
        )
        db.session.add(new_member)
        db.session.commit()
        return {'message': 'Member created', 'id': new_member.id}, 201
    
    @jwt_required()
    def put(self, member_id):
        member = Member.query.get(member_id)
        if not member:
            return {'message': 'Member not found'}, 404

        data = request.get_json()
        member.name = data.get('name', member.name)
        member.email = data.get('email', member.email)
        member.phone = data.get('phone', member.phone)
        member.outstanding_debt = data.get('outstanding_debt', member.outstanding_debt)

        db.session.commit()
        return {'message': 'Member updated'}, 200
    
    @jwt_required()
    def delete(self, member_id):
        member = Member.query.get(member_id)
        if not member:
            return {'message': 'Member not found'}, 404

        db.session.delete(member)
        db.session.commit()
        return {'message': 'Member deleted'}, 200
    
class TransactionsResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        member_id = data['member_id']
        book_id = data['book_id']

        # Check if the book exists and has available quantity
        book = Book.query.get(book_id)
        if not book or book.quantity < 1:
            return {'message': 'Book not available'}, 400

        # Check if the member exists
        member = Member.query.get(member_id)
        if not member:
            return {'message': 'Member not found'}, 404

        # Issue the book (create a new transaction)
        transaction = Transaction(
            book_id=book_id,
            member_id=member_id,
            issue_date=datetime.utcnow(),
            rent_fee=0.0  # Initial fee is 0.0; will be calculated on return
        )

        # Reduce the book quantity
        book.quantity -= 1

        db.session.add(transaction)
        db.session.commit()
        return {'message': 'Book issued', 'transaction_id': transaction.id}, 201

api.add_resource(TransactionsResource, '/transactions', '/transactions/<int:transaction_id>')           
api.add_resource(MembersResource, '/members', '/members/<int:member_id>')
api.add_resource(BooksResource, '/books', '/books/<int:book_id>')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)