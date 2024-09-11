# Library Management System

## Overview

The Library Management System is designed to streamline the operations of a local library. This web application enables librarians to efficiently manage books, members, and transactions, thereby simplifying the process of tracking book inventory, issuing and returning books, and managing book fees.

## Tech Stack

- Frontend: React (JavaScript)
- Backend: Flask (Python)
- Database: SQLite
- ORM: SQLAlchemy
- Dependency Management: pipenv (Python), npm (JavaScript)
  
## Features

### Base Library System

1. **Books Management**
   - Maintain a list of books with their stock quantities.
   - Perform CRUD (Create, Read, Update, Delete) operations on books.
   - Search for books by name and author.

2. **Members Management**
   - Maintain a list of library members.
   - Perform CRUD operations on members.

3. **Transactions Management**
   - Issue books to members.
   - Record book returns.
   - Charge a rent fee on book returns.
   - Ensure that a member’s outstanding debt does not exceed KES. 500.
       
## Functionalities

- **Book Management**
  - Add, update, and delete books.
  - View the list of available books and their quantities.
  - Search for books by name or author.

- **Member Management**
  - Add, update, and delete members.
  - View member details and their borrowing history.

- **Transaction Management**
  - Issue books to members.
  - Record book returns and calculate fees.
  - Ensure members do not exceed the maximum allowed debt of KES. 500.
 
## Screens
![Screenshot from 2024-09-11 12-40-33](https://github.com/user-attachments/assets/cd6a9445-6c83-47f8-92ab-43b7b51b0e3b)

![Screenshot from 2024-09-11 12-56-54](https://github.com/user-attachments/assets/dcf7e688-3074-4321-bbf7-1bc94d1c9f5c)

![Screenshot from 2024-09-11 12-44-27](https://github.com/user-attachments/assets/d67b0e5f-2ddf-4427-8499-0df3eb138868)

![Screenshot from 2024-09-11 12-44-43](https://github.com/user-attachments/assets/36c8bc42-2a62-4b31-bdef-2c135f2a3bb9)

![Screenshot from 2024-09-11 12-46-32](https://github.com/user-attachments/assets/603d9a65-4ad3-4ae4-a8f1-29bf272e3856)

![Screenshot from 2024-09-11 12-46-43](https://github.com/user-attachments/assets/84db49de-efa0-4d7c-bf48-8782afc8df8e)

![Screenshot from 2024-09-11 12-50-16](https://github.com/user-attachments/assets/694180cb-085e-4878-bfd9-166e14dc065a)

![Screenshot from 2024-09-11 12-50-33](https://github.com/user-attachments/assets/ea2e8f91-931a-447c-8114-87f05f5dcb8c)

![Screenshot from 2024-09-11 12-50-54](https://github.com/user-attachments/assets/889a1823-1707-4420-825c-17bc1a804a05)

![Screenshot from 2024-09-11 12-51-19](https://github.com/user-attachments/assets/3875f361-b6b5-40bb-8d1b-061c3d9e5a5f)

![Screenshot from 2024-09-11 12-55-32](https://github.com/user-attachments/assets/46ba69c5-8486-48ec-b35c-b35acd0822c6)

![Screenshot from 2024-09-11 12-56-06](https://github.com/user-attachments/assets/90fe4330-0dcd-4d36-9f6b-a92b37f83cad)

## Reports
![Screenshot from 2024-09-11 12-59-25](https://github.com/user-attachments/assets/1318cb7a-3cd1-4fd1-8bd6-ef6efa048021)

![Screenshot from 2024-09-11 13-00-45](https://github.com/user-attachments/assets/a6bab679-d9f1-4993-8f69-3fffefaf588f)

![Screenshot from 2024-09-11 13-01-43](https://github.com/user-attachments/assets/afb7a6e9-36b7-43f6-8dbe-bb417f0eef32)

![Screenshot from 2024-09-11 13-02-36](https://github.com/user-attachments/assets/8ead0d18-c0c1-42e0-8cb5-6bc2b1762987)

## Getting Started

To set up the application locally, follow these steps:

1. **Clone the Repository**

   ```
   git clone https://github.com/0097eo/library_management_system/edit/main/README.md
   ```
2. **Install dependencies**
   - backend
   ```
   pipenv install
   ```
   - frontend
   ```
   npm i
   ```
3. **Activate the virtual environment**

   ```
   pipenv shell
   ```
   
3. **Setup the database**

   ```
   flask db init
   ```

   ```
   flask db migrate
   ```

   ```
   flask db upgrade
   ```

4. **Seed the database**

   ```
   python seed.py
   ```
6. **Run the application**

   ```
   python app.py
   ```
## Usage
- Book Management
    - Access the books management section from the main dashboard to add, update, or delete books.
    - Use the search functionality to find books by name or author
- Members Management
    - Manage members through the members management section.
    - Update member details or delete members as needed.
- Transactions Management
    - Issue books to members and record returns.
    - The system will automatically calculate and apply any applicable fees.
## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) 
