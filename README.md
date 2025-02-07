# Meter Tables Management System

## **Project Overview**

This project is a web-based application that displays and manages meter tables from a MySQL database. The backend is developed using Node.js and Express.js for API handling, while the frontend leverages Angular as the framework for building a dynamic and responsive user interface. Bootstrap is used for UI design elements to enhance the user experience.

## **Key Features**

- **Dashboard:** Displays summary information and analytics for meter tables.
- **State Management:** Manages states with CRUD operations for meters.
- **Firmware Section:** Handles firmware details and management.
- **Device Management:** Allows CRUD operations for managing devices.
- **Pop-up Functionalities:** Interactive pop-ups for form entries, confirmations, and notifications.
- **Responsive Design:** Bootstrap is used to provide a responsive and aesthetically pleasing interface.

---

## **Technologies Used**

### **Backend**

- Node.js
- Express.js
- MySQL

### **Frontend**

- Angular
- Bootstrap

### **API Integration**

- RESTful API architecture

---

## **Installation and Setup**

### **Backend Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/AdityaShirwalkar/Meter-Dashboard.git
   cd Meter-Dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your database password to replace the one in the server.js file.

4. Start the backend server:
   ```bash
   npm start
   ```

### **Frontend Setup**

1. Navigate to the frontend directory:
   ```bash
   cd angular-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Serve the Angular application:
   ```bash
   ng serve
   ```
   The frontend will be accessible at `http://localhost:4200/`.

---

## **Database Schema**

Ensure that your MySQL database is configured with the following essential tables:

- **meters**: Stores meter data.
- **states**: Maintains state information.
- **firmware**: Stores firmware details.
- **devices**: Maintains device information.
- **users**: Maintains user information.

---

## **Usage Instructions**

1. Open the application in your browser at `http://localhost:4200/`.
2. Navigate through different sections using the sidebar:
   - **Dashboard:** View summary metrics.
   - **State:** Manage meter states.
   - **Firmware:** Manage firmware details.
   - **Devices:** Perform CRUD operations on devices.
3. Use the pop-up functionalities for adding, editing, and deleting records.

---

## **Future Enhancements**

- User authentication and role management.
- Enhanced reporting and analytics.
- Improved UI design.
- Integration with external APIs.

---

## **Contributing**

Feel free to fork the repository and submit pull requests for enhancements or bug fixes.

---


## **Contact Information**

For any questions or support, please contact [[adityashirwalkar@gmail.com](mailto\:adityashirwalkar@gmail.com)].

Aditya Shirwalkar

