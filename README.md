
# Link Management System

A modern, full-stack link management application built with Next.js, featuring user authentication, category-based organization, and an admin panel.

## 🚀 Features

- **🔐 Authentication**: Secure login system with NextAuth.js
- **📁 Category Organization**: Links organized in collapsible category cards
- **👥 User Management**: Admin panel for managing users and roles
- **🔗 Link Management**: Full CRUD operations for company links
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS
- **📁 JSON Storage**: Simple file-based storage system
- **🚀 Easy Deployment**: Ready for Vercel deployment

## 🎯 Category Card System

The main dashboard displays links in beautiful category cards:
- **Expandable/Collapsible**: Click category headers to show/hide links
- **Color-Coded**: Each category has a unique color scheme
- **Link Cards**: Individual links displayed as cards with "Open" buttons
- **Responsive**: Adapts to different screen sizes

## 🛠 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git

### Installation

1. **Clone and install**:
```bash
git clone <your-repo-url>
cd link-management-system
npm install
```

2. **Create data directories**:
```bash
mkdir data
```

3. **Create data files**:
   - Copy the `data/users.json` content to `data/users.json`
   - Copy the `data/links.json` content to `data/links.json`

4. **Set up environment variables**:
Create `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📱 Usage

### Public Dashboard
- View links organized by categories
- Each category is a collapsible card
- Click "Open" buttons to visit links
- Beautiful, responsive design

### Admin Features
- **Dashboard**: Overview statistics and quick actions
- **Link Management**: Add, edit, delete links with category selection
- **User Management**: Create and delete users
- **Category Organization**: Links automatically grouped by category

### Categories

Pre-defined categories with color coding:
- **Official** (Blue): Company websites, official pages
- **Internal** (Green): Employee portals, internal tools
- **Support** (Red): Help desks, customer support
- **Resources** (Purple): Documentation, guides
- **Tools** (Yellow): Development tools, utilities
- **Social** (Pink): Social media, community
- **Development** (Indigo): Code repositories, dev tools
- **Finance** (Orange): Financial tools, reports

## 📁 Project Structure

```
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── layout.js    # Admin layout with navigation
│   │   ├── page.js      # Admin dashboard
│   │   ├── links/       # Link management
│   │   └── users/       # User management
│   ├── login/           # Authentication page
│   ├── page.js          # Main dashboard with category cards
│   └── layout.js        # Root layout
├── pages/
│   └── api/             # API routes
│       ├── auth/        # NextAuth configuration
│       ├── links/       # Link CRUD operations
│       └── users/       # User CRUD operations
├── lib/
│   └── data-access.js   # File-based data operations
├── data/
│   ├── users.json       # User data storage
│   └── links.json       # Link data storage
```

## 🔧 Technologies Used

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Authentication**: NextAuth.js with credentials provider
- **Storage**: JSON files with Node.js fs module
- **Data Fetching**: SWR for client-side data fetching
- **Styling**: Tailwind CSS with gradients and animations
- **Icons**: Heroicons (via Tailwind/SVG)

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXTAUTH_SECRET`: Generate a secure secret
   - `NEXTAUTH_URL`: Your production URL
4. Deploy

**Note**: JSON file storage works on Vercel but files will reset on each deployment. For production, consider upgrading to a database.

## 🎨 Customization

### Adding New Categories

1. Update `predefinedCategories` in `app/admin/links/page.js`
2. Add color mapping in `categoryColors` in `app/page.js`
3. Links will automatically organize into new categories

### Styling

The app uses Tailwind CSS with:
- Gradient backgrounds and buttons
- Smooth transitions and hover effects
- Responsive grid layouts
- Card-based design system

## 📝 License

This project is licensed under the MIT License.

export default function Dashboard() {
  const { data: session } = useSession()
  const { data: categorizedLinks, error } = useSWR('/api/links?grouped=true', fetcher)

  if (error) return <div className="text-center py-12 text-red-600">Failed to load links</div>
  if (!categorizedLinks) return <div className="text-center py-12 text-gray-600">Loading...</div>

  const categories = Object.keys(categorizedLinks).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Company Links Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    Welcome, {session.user.username}
                  </span>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Access Links</h2>
            <p className="text-gray-600">Browse our organized collection of company resources</p>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                links={categorizedLinks[category]}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {Object.values(categorizedLinks).flat().length}
                </div>
                <div className="text-gray-600">Total Links</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {categories.length}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {session ? '✓' : '○'}
                </div>
                <div className="text-gray-600">User Status</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

(false)
    } else {
      const session = await getSession()
      if (session?.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({
                  ...credentials,
                  username: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] font-medium"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">
              Demo credentials: <span className="font-medium">admin / admin123</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}