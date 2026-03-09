import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Table, ArrowRight, Database, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-stone-900">
            From Static Sheets to <span className="text-emerald-600">Dynamic Data</span>
          </h1>
          <p className="mt-6 text-xl text-stone-600 leading-relaxed">
            Replace your clunky Excel files with a modern, secure, and searchable web application. 
            Manage your records with ease and professional-grade tools.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Link 
            to="/records" 
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 group"
          >
            View Records <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/add" 
            className="bg-white text-stone-900 border border-stone-200 px-8 py-4 rounded-2xl font-semibold hover:bg-stone-50 transition-all flex items-center gap-2"
          >
            <PlusCircle size={20} /> Add New Record
          </Link>
        </motion.div>
      </section>

      {/* Quick Search Section */}
      <section className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder="Quick search by name or description..." 
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/records?search=${(e.target as HTMLInputElement).value}`;
                }
              }}
            />
          </div>
          <button className="bg-stone-900 text-white px-6 py-4 rounded-2xl font-medium hover:bg-stone-800 transition-all hidden sm:block">
            Search
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Centralized Database',
            desc: 'No more version conflicts. One source of truth for all your data.',
            icon: Database,
            color: 'bg-blue-50 text-blue-600'
          },
          {
            title: 'Admin Security',
            desc: 'Protect sensitive operations with secure authentication and role-based access.',
            icon: ShieldCheck,
            color: 'bg-purple-50 text-purple-600'
          },
          {
            title: 'Instant Insights',
            desc: 'Visualize your data with real-time dashboards and distribution charts.',
            icon: Zap,
            color: 'bg-amber-50 text-amber-600'
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 bg-white rounded-3xl border border-stone-200 hover:shadow-md transition-shadow"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", feature.color)}>
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer Preview */}
      <footer className="pt-16 border-t border-stone-200 text-center text-stone-500 text-sm">
        <p>© 2024 Hire Drive. Built for efficiency and clarity.</p>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
