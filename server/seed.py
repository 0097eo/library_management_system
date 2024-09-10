from faker import Faker
from models import db, Book, Member, Transaction, Librarian
from config import app
from datetime import timedelta
import random

fake = Faker()
book_categories = [
    "Science Fiction","Thriller", "Romance", 
    "Historical Fiction", "Non-Fiction", "Business", "Technology"
]

def generate_phone_number():
    return f"+2547{random.randint(0, 9)}{random.randint(0, 9999999):07d}"
def seed_data():
    print('Creating librarians...')
    librarians = []
    for _ in range(3):
        librarian = Librarian(
            username=fake.user_name(),
            password='librarian123'
        )
        librarians.append(librarian)
    
    db.session.add_all(librarians)
    db.session.commit()

    print("Creating books...")
    books = []
    for _ in range(50):
        book = Book(
            title=fake.catch_phrase(),
            author=fake.name(),
            isbn=fake.isbn13(),
            quantity=random.randint(1, 10),
            category=random.choice(book_categories)
        )
        books.append(book)
    
    db.session.add_all(books)
    db.session.commit()

    print("Creating members...")
    members = []
    for _ in range(20):
        member = Member(
            name=fake.name(),
            email=fake.email(),
            phone=generate_phone_number(),
            outstanding_debt=round(random.uniform(0, 500), 2)
        )
        members.append(member)
    
    db.session.add_all(members)
    db.session.commit()

    print("Creating transactions...")
    transactions = []
    for _ in range(100):
        book = random.choice(books)
        member = random.choice(members)
        issue_date = fake.date_time_between(start_date='-1y', end_date='now')
        return_date = issue_date + timedelta(days=random.randint(1, 30))
        
        transaction = Transaction(
            book_id=book.id,
            member_id=member.id,
            issue_date=issue_date,
            return_date=return_date if random.random() > 0.2 else None 
        )
        
        if transaction.return_date:
            transaction.calculate_rent_fee()
        
        transactions.append(transaction)
    
    db.session.add_all(transactions)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()
        db.create_all()
        seed_data()
        print("Database seeded successfully!")