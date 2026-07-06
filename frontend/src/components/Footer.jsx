import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          
          {/* Institute Section */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-sky-400">NIT Jalandhar</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Dr. B R Ambedkar National Institute of Technology, Jalandhar
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              An Institute of National Importance under Ministry of Education, Government of India
            </p>
          </div>

          {/* Smart Hostel Mess Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-sky-300">NITJ Hostel Mess</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Digital mess management system for efficient meal tracking, attendance monitoring, and comprehensive reporting.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-sky-300">Quick Links</h3>
            <ul className="space-y-2.5 text-gray-300 text-sm">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-sky-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Weekly Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> Contact
                </Link>
              </li>
              <li>
                <a href="https://nitj.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors flex items-center">
                  <span className="mr-2">›</span> NIT Jalandhar Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-sky-300">Contact Information</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-sky-400" />
                <span>NIT Jalandhar, G.T. Road, Jalandhar, Punjab - 144011</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-sky-400" />
                <span>+91-181-2690301</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-sky-400" />
                <span>mess@nitj.ac.in</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-sky-300">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-sky-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-sky-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-sky-600 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-sky-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} NIT Jalandhar. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-3 md:mt-0">
              <Link to="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link>
              <Link to="/feedback" className="hover:text-sky-400 transition-colors">Feedback</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}