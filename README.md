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

![Screenshot from 2024-09-17 19-30-04](https://github.com/user-attachments/assets/0762d4fb-8ded-4391-90cf-dbf48b3beac3)

![Screenshot from 2024-09-17 19-31-30](https://github.com/user-attachments/assets/d816bde5-673e-44a8-98b0-a9c29528db86)


![Screenshot from 2024-09-17 19-33-03](https://github.com/user-attachments/assets/7c8f8886-3b92-4086-acbb-896bbeb4977c)


![Screenshot from 2024-09-17 19-33-34](https://github.com/user-attachments/assets/46cdafc3-8059-4538-b11e-1a7e889dad75)


![Screenshot from 2024-09-17 19-38-38](https://github.com/user-attachments/assets/4e7482c3-c3ad-4cd3-9f3b-cdc3d91230ad)


## Reports
![Screenshot from 2024-09-17 19-39-17](https://github.com/user-attachments/assets/222a5524-21de-4a0d-a1fd-5d3e9e29805e)


## Getting Started

To set up the application locally, follow these steps:

1. **Clone the Repository**

   ```
   git clone [https://github.com/0097eo/library_management_system/edit/main/README.md](https://github.com/0097eo/library_management_system.git)
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
