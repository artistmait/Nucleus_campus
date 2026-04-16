import React from "react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import {
  FileAxis3D,
  CheckCircle2Icon,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="bg-[#f7f9fb] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#100563] to-[#2a14b4] text-[#ffffff] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center flex flex-col items-center relative z-10">
          <h1 className="text-4xl md:text-[56px] font-extrabold tracking-tight leading-tight">
            Welcome to <span className="text-[#a7a5ff]">NUCLEUS</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl text-[#e3dfff] font-medium">
            Your Digital Campus Assistant — making academics simpler, faster and
            accessible anytime.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a
              href="#explore"
              className="px-8 py-3.5 bg-[#e3dfff] text-[#100069] font-bold rounded-xl shadow-[0_4px_12px_rgba(42,20,180,0.3)] hover:shadow-[0_6px_20px_rgba(227,223,255,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Explore Sections
            </a>
            <a
              href="#about"
              className="px-8 py-3.5 border border-[#a7a5ff] text-[#ffffff] rounded-xl font-bold hover:bg-[#a7a5ff]/10 hover:-translate-y-0.5 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
        {/* Subtle background glow effect mimicking atrium reflections */}
        <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[150%] bg-[#4338ca] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#191c1e] tracking-tight">
            Why Choose NUCLEUS?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300">
              <FileAxis3D className="mx-auto bg-[#f7f9fb] text-[#4338ca] p-4 rounded-full size-[72px]" />
              <h3 className="mt-6 font-bold text-xl text-[#191c1e]">Digital Processing</h3>
              <p className="mt-3 text-[#464554]">
                Fast and secure online application process in real-time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300">
              <CheckCircle2Icon className="mx-auto bg-[#f7f9fb] text-[#4338ca] p-4 rounded-full size-[72px]" />
              <h3 className="mt-6 font-bold text-xl text-[#191c1e]">Verified Documents</h3>
              <p className="mt-3 text-[#464554]">
                Officially authenticated certificates and transcripts.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300">
              <Clock className="mx-auto bg-[#f7f9fb] text-[#4338ca] p-4 rounded-full size-[72px]" />
              <h3 className="mt-6 font-bold text-xl text-[#191c1e]">24/7 Access</h3>
              <p className="mt-3 text-[#464554]">
                Submit applications anytime and track progress instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white shadow-[0_-4px_20px_rgba(49,46,129,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1e] tracking-tight">
              About NUCLEUS
            </h2>
            <p className="mt-6 text-[#464554] leading-relaxed text-lg">
              NUCLEUS is your one-stop platform for managing academic
              applications, certifications, library resources, and institutional
              services. Designed for efficiency, transparency, and ease of use —
              empowering students and faculty alike.
            </p>
            <a
              href="#explore"
              className="mt-8 inline-block px-8 py-3.5 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white rounded-xl font-bold hover:shadow-[0_6px_20px_rgba(42,20,180,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </a>
          </div>
          <div className="rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(49,46,129,0.08)]">
            <img
              src="/assets/study_one.jpg"
              alt="Campus"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Explore Sections */}
      <section id="explore" className="py-20 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#191c1e] tracking-tight">
            Explore Sections
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-10 shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
              <GraduationCap className="mx-auto size-16 text-[#2a14b4]" />
              <h3 className="mt-6 text-xl font-bold text-[#191c1e]">Exam Section</h3>
              <p className="mt-3 text-[#464554] flex-grow">
                Manage applications, results, and certifications with ease.
              </p>
              <a
                href="/student/exam-section"
                className="mt-6 inline-block w-full px-6 py-3 bg-[#f2f4f6] text-[#4338ca] rounded-xl font-semibold hover:bg-[#e3dfff] transition-colors"
              >
                Go to Exam
              </a>
            </div>

            <div className="bg-white p-10 shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
              <BookOpen className="mx-auto size-16 text-[#2a14b4]" />
              <h3 className="mt-6 text-xl font-bold text-[#191c1e]">Library Section</h3>
              <p className="mt-3 text-[#464554] flex-grow">
                Access academic resources, research databases, and digital
                materials.
              </p>
              <a
                href="#"
                className="mt-6 inline-block w-full px-6 py-3 bg-[#f2f4f6] text-[#4338ca] rounded-xl font-semibold hover:bg-[#e3dfff] transition-colors"
              >
                Go to Library
              </a>
            </div>

            <div className="bg-white p-10 shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
              <Users className="mx-auto size-16 text-[#2a14b4]" />
              <h3 className="mt-6 text-xl font-bold text-[#191c1e]">Admin Office</h3>
              <p className="mt-3 text-[#464554] flex-grow">
                Student services, document processing, and institutional
                procedures.
              </p>
              <a
                href="#"
                className="mt-6 inline-block w-full px-6 py-3 bg-[#f2f4f6] text-[#4338ca] rounded-xl font-semibold hover:bg-[#e3dfff] transition-colors"
              >
                Go to Admin Office
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white text-center relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10">
          Ready to Experience Digital Campus?
        </h2>
        <p className="mt-6 text-lg text-[#e3dfff] relative z-10">
          Join thousands of students who trust NUCLEUS for their academic needs.
        </p>
        <a
          href="#"
          className="relative z-10 mt-10 inline-block px-10 py-4 bg-white text-[#100069] font-bold rounded-xl shadow-[0_4px_12px_rgba(42,20,180,0.3)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all"
        >
          Apply Now
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
