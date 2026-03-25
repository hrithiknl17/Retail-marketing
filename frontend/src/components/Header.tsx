import { Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  userRole: 'admin' | 'customer';
}

export default function Header({ title, userRole }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <h2 className="text-2xl font-semibold text-zinc-800 tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder={userRole === 'customer' ? "Search products..." : "Search inventory, vendors..."}
            className="pl-10 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all w-64 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-800">
              {userRole === 'customer' ? 'Valued Customer' : 'Store Owner'}
            </p>
            <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
