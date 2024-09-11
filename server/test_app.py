from config import app as flask_app
import unittest
from datetime import datetime, timedelta
from app import db, Librarian, Book, Member, Transaction
from flask_jwt_extended import create_access_token

class LibraryAppTestCase(unittest.TestCase):
    def setUp(self):
        flask_app.config['TESTING'] = True
        flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
        self.app = flask_app.test_client()
        with flask_app.app_context():
            db.create_all()
            
        self.create_sample_data()

    def tearDown(self):
        with flask_app.app_context():
            db.session.remove()
            db.drop_all()

    def create_sample_data(self):
        with flask_app.app_context():
            # Create a librarian
            librarian = Librarian(username='testlibrarian', password='password123')
            db.session.add(librarian)

            # Create a book
            book = Book(title='Test Book', author='Test Author', isbn='1234567890', quantity=5, category='Fiction')
            db.session.add(book)

            # Create a member
            member = Member(name='Test Member', email='test@example.com', phone='1234567890')
            db.session.add(member)

            db.session.commit()

    def get_auth_token(self):
        with flask_app.app_context():
            librarian = Librarian.query.filter_by(username='testlibrarian').first()
            return create_access_token(identity=librarian.id)

    def test_login(self):
        response = self.app.post('/login', json={
            'username': 'testlibrarian',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json)

    def test_get_librarian_profile(self):
        token = self.get_auth_token()
        response = self.app.get('/profile', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('username', response.json)
        self.assertEqual(response.json['username'], 'testlibrarian')

    def test_get_books(self):
        token = self.get_auth_token()
        response = self.app.get('/books', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        self.assertEqual(len(response.json), 1)
        self.assertEqual(response.json[0]['title'], 'Test Book')

    def test_create_book(self):
        token = self.get_auth_token()
        new_book = {
            'title': 'New Test Book',
            'author': 'New Test Author',
            'isbn': '0987654321',
            'quantity': 3,
            'category': 'Non-Fiction'
        }
        response = self.app.post('/books', json=new_book, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)

    def test_update_book(self):
        token = self.get_auth_token()
        with flask_app.app_context():
            book = Book.query.first()
        
        updated_book_data = {
            'title': 'Updated Test Book',
            'author': 'Updated Test Author',
            'isbn': '1111111111',
            'quantity': 10,
            'category': 'Updated Fiction'
        }
        
        response = self.app.put(f'/books/{book.id}', json=updated_book_data, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], 'Book updated successfully')
        
        # Verify the book was actually updated
        response = self.app.get(f'/books/{book.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['title'], 'Updated Test Book')
        self.assertEqual(response.json['author'], 'Updated Test Author')
        self.assertEqual(response.json['isbn'], '1111111111')
        self.assertEqual(response.json['quantity'], 10)
        self.assertEqual(response.json['category'], 'Updated Fiction')

    def test_delete_book(self):
        token = self.get_auth_token()
        with flask_app.app_context():
            book = Book.query.first()
        
        response = self.app.delete(f'/books/{book.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Book deleted successfully')
        
        # Verify the book was actually deleted
        response = self.app.get(f'/books/{book.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], 'Book not found')

    def test_get_members(self):
        token = self.get_auth_token()
        response = self.app.get('/members', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        self.assertEqual(len(response.json), 1)
        self.assertEqual(response.json[0]['name'], 'Test Member')

    def test_create_member(self):
        token = self.get_auth_token()
        new_member = {
            'name': 'New Test Member',
            'email': 'newtest@example.com',
            'phone': '9876543210'
        }
        response = self.app.post('/members', json=new_member, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)

    def test_update_member(self):
        token = self.get_auth_token()
        with flask_app.app_context():
            member = Member.query.first()
        
        updated_member_data = {
            'name': 'Updated Test Member',
            'email': 'updatedtest@example.com',
            'phone': '5555555555',
            'outstanding_debt': 100.0
        }
        
        response = self.app.put(f'/members/{member.id}', json=updated_member_data, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Member updated')
        
        # Verify the member was actually updated
        response = self.app.get(f'/members/{member.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['name'], 'Updated Test Member')
        self.assertEqual(response.json['email'], 'updatedtest@example.com')
        self.assertEqual(response.json['phone'], '5555555555')
        self.assertEqual(response.json['outstanding_debt'], 100.0)

    def test_delete_member(self):
        token = self.get_auth_token()
        with flask_app.app_context():
            member = Member.query.first()
        
        response = self.app.delete(f'/members/{member.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Member deleted')
        
        # Verify the member was actually deleted
        response = self.app.get(f'/members/{member.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], 'Member not found')

    def test_create_transaction(self):
        token = self.get_auth_token()
        with flask_app.app_context():
            member = Member.query.first()
            book = Book.query.first()
            
        transaction_data = {
            'member_id': member.id,
            'book_id': book.id
        }
        response = self.app.post('/transactions', json=transaction_data, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('transaction_id', response.json)

    def test_return_book(self):
        # First, create a transaction
        self.test_create_transaction()
        
        token = self.get_auth_token()
        with flask_app.app_context():
            transaction = Transaction.query.first()
            
        response = self.app.put(f'/transactions/{transaction.id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('rent_fee', response.json)
        self.assertIn('total_debt', response.json)

if __name__ == '__main__':
    unittest.main()