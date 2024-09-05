from config import app, db, api
from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import Librarian, Book, Member, Transaction
from datetime import timedelta, datetime

DAILY_RENTAL_FEE = 1.50
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
    
class LibrarianProfile(Resource):
    @jwt_required()
    def get(self):
        # Get the ID of the logged-in librarian from the JWT token
        librarian_id = get_jwt_identity()
        
        # Query the librarian's details from the database
        librarian = Librarian.query.get(librarian_id)
        if not librarian:
            return {'message': 'Librarian not found'}, 404

        # Return the librarian's profile information
        return {
            'id': librarian.id,
            'username': librarian.username,
            'created_at': librarian.created_at.strftime('%Y-%m-%d'),
            'updated_at': librarian.updated_at.strftime('%Y-%m-%d')
        }, 200
    

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
            # Get search parameters
            title = request.args.get('title')
            author = request.args.get('author')

            # Search by title and author
            query = Book.query
            if title:
                query = query.filter(Book.title.ilike(f'%{title}%'))
            if author:
                query = query.filter(Book.author.ilike(f'%{author}%'))
            
            books = query.all()
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
            
            # Fetch all transactions for this member
            transactions = Transaction.query.filter_by(member_id=member.id).all()

            borrowed_books = []
            unreturned_books = []
            for transaction in transactions:
                book = transaction.book
                borrowed_books.append({
                    'title': book.title,
                    'author': book.author,
                    'isbn': book.isbn,
                    'issue_date': transaction.issue_date.strftime('%Y-%m-%d'),
                    'return_date': transaction.return_date.strftime('%Y-%m-%d') if transaction.return_date else None
                })
                
                if transaction.return_date is None:
                    unreturned_books.append({
                        'title': book.title,
                        'author': book.author,
                        'isbn': book.isbn,
                        'issue_date': transaction.issue_date.strftime('%Y-%m-%d')
                    })

            return {
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'phone': member.phone,
                'outstanding_debt': member.outstanding_debt,
                'borrowed_books': borrowed_books,
                'unreturned_books': unreturned_books,
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
    def get(self):
        
        member_id = request.args.get('member_id')
        book_id = request.args.get('book_id')

        query = Transaction.query

        if member_id:
            query = query.filter_by(member_id=member_id)
        if book_id:
            query = query.filter_by(book_id=book_id)

        transactions = query.all()

        result = []
        for transaction in transactions:
            result.append({
                'id': transaction.id,
                'book': {
                    'id': transaction.book.id,
                    'title': transaction.book.title,
                    'author': transaction.book.author,
                    'isbn': transaction.book.isbn
                },
                'member': {
                    'id': transaction.member.id,
                    'name': transaction.member.name,
                    'email': transaction.member.email
                },
                'issue_date': transaction.issue_date.strftime('%Y-%m-%d'),
                'return_date': transaction.return_date.strftime('%Y-%m-%d') if transaction.return_date else None,
                'rent_fee': transaction.rent_fee
            })

        return result, 200
    @jwt_required()
    def post(self):
        data = request.get_json()
        member_id = data['member_id']
        book_id = data['book_id']

        # Ensure member's outstanding debt does not exceed KES 500
        member = Member.query.get(member_id)
        if not member:
            return {'message': 'Member not found'}, 404

        if member.outstanding_debt >= 500:
            return {'message': 'Cannot issue book. Outstanding debt exceeds KES 500'}, 403

        # Issue the book
        book = Book.query.get(book_id)
        if not book:
            return {'message': 'Book not found'}, 404

        if book.quantity <= 0:
            return {'message': 'Book not available'}, 400

        transaction = Transaction(
            member_id=member.id,
            book_id=book.id,
            issue_date=datetime.utcnow()
        )
        book.quantity -= 1

        db.session.add(transaction)
        db.session.commit()

        return {'message': 'Book issued successfully', 'transaction_id': transaction.id}, 201

    
    @jwt_required()
    def put(self, transaction_id):
        # Handle book return
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return {'message': 'Transaction not found'}, 404

        if transaction.return_date:
            return {'message': 'Book already returned'}, 400

        # Set the return date to now
        transaction.return_date = datetime.utcnow()
        
        # Calculate rent fee
        days_rented = (transaction.return_date - transaction.issue_date).days
        transaction.rent_fee = DAILY_RENTAL_FEE * max(1, days_rented)

        # Update the member's outstanding debt
        member = transaction.member
        member.outstanding_debt += transaction.rent_fee

        # Update the book quantity
        book = transaction.book
        book.quantity += 1

        db.session.commit()
        return {
            'message': 'Book returned successfully',
            'rent_fee': transaction.rent_fee,
            'total_debt': member.outstanding_debt
        }, 200

api.add_resource(LibrarianProfile, '/profile')
api.add_resource(TransactionsResource, '/transactions', '/transactions/<int:transaction_id>')           
api.add_resource(MembersResource, '/members', '/members/<int:member_id>')
api.add_resource(BooksResource, '/books', '/books/<int:book_id>')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)