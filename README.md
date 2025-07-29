# 🎓 Vignan Event Management Portal

A responsive web application for managing student events at Vignan Institute. It supports **student and admin login**, **event registration**, **dashboard analytics**, and **role-based access control**.

---

## 📌 Features

### 🧑‍🎓 Student Module
- Register/login with official Vignan email
- View upcoming campus events
- Register for multiple categories (Dance, Cultural, Tech, etc.)
- Track:
  - Registered events
  - Attended events
  - Points earned

### 🧑‍💼 Admin Module
- Manage student registrations
- Create/update/delete events
- View analytics:
  - Total events
  - Registered students
  - Active events
  - Total registrations
- Manage event categories

---

## 🖼️ Screenshots

### 🔐 Student Login & Registration
![Student Login](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/1.png)
![Student Registration](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/2.png)

### 📊 Student Dashboard
![Student Dashboard](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/3.png)

### 📝 Event Registration Form
![Event Registration Form](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/4.png)

### 🧑‍💼 Admin Dashboard
![Admin Dashboard](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/5.png)

### 🆕 Create New Event (Admin)
![Create New Event](https://raw.githubusercontent.com/rupa-1122/EventManagementSystem/refs/heads/main/img/6.png)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React.js, Tailwind CSS |
| Backend  | Node.js / Express (or your backend setup) |
| Database | MongoDB / MySQL (based on your setup) |
| Auth     | Email/Password-based login |
| Hosting  | Netlify / Vercel / Render / Firebase (optional) |

---

## 🏁 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/vignan-event-management.git
cd vignan-event-management

# Install dependencies
npm install

# Start the development server
npm run dev
⚠️ Ensure MongoDB/MySQL is running locally and DB connection string is set in .env.

## 📋 Registration Rules
Students must use Vignan domain email (21NM1AXXXX@view.edu.in)

Passwords should include:

Uppercase letter

Number

Special character

## 📂 Project Structure
bash
Copy
Edit
├── client/                  # Frontend React app
│   ├── components/
│   ├── pages/
│   └── ...
├── server/                  # Backend (Express/Spring Boot)
│   ├── routes/
│   ├── controllers/
│   └── ...
├── screenshots/             # Screenshots for README
├── .env
└── README.md
## 👩‍💻 Author
Rupa Padala
📫 GitHub Profile(https://github.com/rupa-1122/)

## 📃 License
This project is licensed under the MIT License – see the LICENSE file for details.
