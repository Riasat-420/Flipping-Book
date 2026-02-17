# WeFlipPage - Interactive Flipbook Application

A modern, full-stack web application for creating and sharing interactive PDF flipbooks with stunning 3D page-turning effects. Built with React, Node.js, and MongoDB.

![WeFlipPage Logo](./frontend/src/assets/logo-black.png)

## 🌟 Features

### User Features
- **PDF Upload**: Upload PDF files and convert them to interactive flipbooks
- **3D Page Flip Effect**: Realistic page-turning animations with sound effects
- **Theme Support**: Dynamic dark/light mode with theme-aware branding
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Share & Access**: Generate unique access links to share flipbooks
- **Download & Print**: Download original PDFs or print flipbooks

### Admin Features
- **Admin Dashboard**: Comprehensive statistics and management panel
- **User Management**: View and manage all registered users
- **Flipbook Management**: Monitor, extend, or delete flipbooks
- **Image Slider**: Manage homepage carousel images
- **Access Control**: Secure admin authentication with JWT

## 🚀 Tech Stack

### Frontend
- **React** 18 - UI library
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **react-pageflip** - Page flip animations
- **PDF.js** - PDF rendering

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB Atlas** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **PDF-lib** - PDF processing
- **Nodemailer** - Email notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Riasat-420/Flipping-Book.git
cd Flipping-Book
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
BASE_URL=http://localhost:5000
FRONT_URI=http://localhost:5173
ADMIN_EMAIL=admin@example.com
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=10d
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🏃‍♂️ Running the Application

### Development Mode

**Start Backend Server:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

**Start Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

## 📁 Project Structure

```
Flipping-Book/
├── backend/
│   ├── server/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Entry point
│   ├── uploads/              # Uploaded files (gitignored)
│   ├── package.json
│   └── .env                  # Environment variables (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Images, logos, sounds
│   │   ├── components/       # React components
│   │   ├── context/          # React context (Theme)
│   │   ├── pages/            # Page components
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Public assets
│   ├── package.json
│   └── .env                  # Environment variables (gitignored)
│
└── README.md
```

## 🎨 Key Features Implementation

### Theme-Based Logo Switching
The application features dynamic logo switching based on theme mode:
- **Light Mode**: Black logo for better visibility
- **Dark Mode**: White logo with transparent background
- Automatic switching across all pages (Header, Admin Panel, Flipbook Viewer)

### Flipbook Viewer
- Realistic 3D page-turning animations
- Sound effects for page flips
- Zoom controls (0.5x to 2x)
- Thumbnail grid view
- Fullscreen mode
- Print and download functionality
- Share via link or native share API

### Admin Panel
Access at `/admin`
- First-time setup creates admin account
- JWT-based authentication
- Statistics dashboard
- Flipbook management (extend, make permanent, delete)
- User management
- Image slider management for homepage

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Secure admin routes
- Environment variable protection
- File upload validation
- CORS configuration

## 🌐 API Endpoints

### Flipbook Routes
- `POST /api/flipbook/upload` - Upload PDF
- `GET /api/flipbook/:token/metadata` - Get flipbook metadata
- `GET /api/flipbook/:token/page/:pageNumber` - Get specific page
- `GET /api/flipbook/:token/download` - Download PDF

### Admin Routes (Protected)
- `POST /api/admin/auth/register` - Register admin
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/flipbooks` - Get all flipbooks
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/flipbook/:id` - Update flipbook

### Image Slider Routes
- `GET /api/imageslider` - Get all slider images
- `POST /api/imageslider/upload` - Upload slider image (admin)
- `DELETE /api/imageslider/:id` - Delete slider image (admin)

## 🎯 Usage

### For Users
1. Visit the homepage
2. Enter your name and email
3. Upload a PDF file
4. Receive access link via email
5. View your interactive flipbook
6. Share, download, or print

### For Admins
1. Navigate to `/admin`
2. Create admin account (first time only)
3. Login with credentials
4. Access dashboard to:
   - View statistics
   - Manage flipbooks
   - Manage users
   - Update homepage slider images

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Riasat**
- GitHub: [@Riasat-420](https://github.com/Riasat-420)

## 🙏 Acknowledgments

- React PageFlip library for amazing flip animations
- PDF.js for PDF rendering capabilities
- All contributors and users of this project

## 📧 Support

For support, email muhammadriasatali40@gmail.com or open an issue in this repository.

---

**Made with ❤️ by Riasat**
