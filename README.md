
# Activity342 - Full-Stack Service Request System

A full-stack web application built using **Spring Boot** and **React** that allows users to register, log in, and manage their service requests through a secure JWT-authenticated dashboard.
  

## Features

  

-  **User Authentication & Authorization:** Secure registration and login using JWT (JSON Web Tokens) and Spring Security.

-  **Role & Access Control:** Strict resource ownership checks ensuring users cannot view, update, or delete another user's service requests.

-  **Service Request CRUD Operations:**

- Create new service requests.

- Read/view service requests belonging exclusively to the authenticated user.

- Update service request details (title, description, status).

- Delete service requests.

-  **RESTful API Architecture:** Standardized HTTP responses (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`).



  

## Tech Stack

  

### Backend

-  **Framework:** Java / Spring Boot

-  **Security:** Spring Security & JWT (`jjwt`)

-  **Database / ORM:** Spring Data JPA (H2 / MySQL)

-  **Build Tool:** Maven

  

### Frontend

-  **Library:** React (Vite / Create React App)

-  **HTTP Client:** Axios (configured with `Authorization: Bearer <token>` headers)

-  **Routing:** React Router DOM



  

## Prerequisites

**Before running the project, ensure you have the following installed on your machine:**

  

Java Development Kit (JDK 17 or higher)

  

Apache Maven

  

Node.js (v18 or higher) & npm

  

Git

  
## Setup & Installation Instructions

1. Clone the Repository

```
	git clone https://github.com/ChristianOnting/Activity342.git

	cd Activity342
```

  

2. Backend Setup (Spring Boot)

- Navigate to the backend directory:

```
	cd activity1
```

### Configure database settings in src/main/resources/application.properties (if required):

```
server.port=8080

//Database configuration (Adjust if using MySQL instead of H2)

spring.datasource.url=jdbc:h2:mem:testdb

spring.datasource.driverClassName=org.h2.Driver

spring.datasource.username=sa

spring.datasource.password=

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

spring.h2.console.enabled=true

  

//JWT Configuration

jwt.secret=YourSecretKeyHereForJWTGenerationAndValidation123456

```

  

- Build and install dependencies:

```
	mvn clean install
```

- Run the Spring Boot server:
```
	mvn spring-boot:run
```

  

3. Frontend Setup (React)

- Open a new terminal window and navigate to the frontend directory:

```
	cd reactjs
```

- Install the necessary node dependencies:
```
	npm install
```
  

- Start the React development server:
```
	npm run dev
```
  

---

  

## Application Usage & API Flow

Register: Create a new user account on the Registration page.

  

Login: Log in with your credentials. On success, the API returns a JWT token which is stored locally in localStorage.

  

Dashboard Access: Navigating to the Dashboard loads the user's service requests using the Bearer Token authentication.

  

CRUD Execution: Perform Create, Read, Edit, or Delete actions on service requests. Unauthorized access across users is intercepted and blocked with HTTP 403 Forbidden.

  

---

  

## Author

- Christian Onting - https://github.com/ChristianOnting

  

---

  

## Project Structure

  

```text

Activity342/

├── activity1/ # Spring Boot Backend

│ ├── src/

│ │ ├── main/

│ │ │ ├── java/edu/cit/onting/activity1/

│ │ │ │ ├── config/ # CorsConfig, JwtAuthenticationFilter, SecurityConfig

│ │ │ │ ├── controller/ # ServiceRequestController, UserController

│ │ │ │ ├── model/ # ServiceRequest, User

│ │ │ │ ├── repository/ # ServiceRequestRepository, UserRepository

│ │ │ │ ├── service/ # CustomUserDetailsService

│ │ │ │ └── util/ # JwtUtil

│ │ │ └── resources/ # application.properties

│ └── pom.xml

└── frontend/ # React Frontend

├── src/

│ ├── components/ # Login, Register, Dashboard

│ ├── App.jsx

│ └── main.jsx

└── package.json
