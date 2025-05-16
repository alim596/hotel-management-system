import { useState } from "react";
import {IoLogInOutline} from "react-icons/io5";
import { RiMailSendLine } from "react-icons/ri";
import { Link } from "react-router-dom";


function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        {/* Left side: Logo and menu */}
        <div className="flex items-center gap-6">
          <Link to="/"
            className="text-2xl font-bold text-gray-800 flex items-center gap-2 hover:text-blue-600 cursor-pointer">
            Hotel Booking System
            </Link>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-5 mt-3 sm:mt-0 text-sm">
          <span className="text-gray-700 font-medium">TRY </span>
          <Link to="/support" className="text-red-600 hover:underline font-medium">
            Support
          </Link>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Travels
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Register
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium flex items-center gap-1">
            <IoLogInOutline />Log in
          </a>
        </div>
      </div>
    </nav>
  );
}


export default function Support() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch("http://localhost:3000/api/support", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        });

        if (response.ok) {
        console.log("Form submitted successfully!");
        setSubmitted(true);
        } else {
        console.error("Submission failed:", response.statusText);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
    }
    };
  return (
    <>
      <Navbar /> {/*Navbar included */}
      <div className="bg-gray-50 min-h-screen p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">Support</h1> {/*Heading */}
        
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT SIDE */}
            <div className="bg-blue-900 text-white p-8 space-y-8">
              <h2 className="text-2xl font-bold text-center">Get In Touch With Us Now!</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">📞 Phone Number</h3>
                  <p>+90 555 123 4567</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">📧 Email</h3>
                  <p>info@hotelbooking.com</p>
                  <p>support@hotelbooking.com</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">📍 Location</h3>
                  <p>123 Example Street, Istanbul, Turkey</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">🕘 Working Hours</h3>
                  <p>Monday to Saturday, 09:00 AM – 06:00 PM</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="p-8 bg-gray-100">
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>

              {submitted ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-md">
                  ✅ Your message has been submitted. We’ll get back to you soon!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={handleChange}
                      className="p-2 border rounded w-full"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="p-2 border rounded w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Mobile No *"
                      value={form.mobile}
                      onChange={handleChange}
                      className="p-2 border rounded w-full"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email ID *"
                      value={form.email}
                      onChange={handleChange}
                      className="p-2 border rounded w-full"
                      required
                    />
                  </div>

                  <textarea
                    name="message"
                    placeholder="Message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border rounded p-2"
                  />
                  <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md flex items-center gap-2">
                        Submit <RiMailSendLine />
                    </button>
                  </div>
                  
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
