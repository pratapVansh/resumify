import { ReactNode } from 'react';
import { FileText, Zap, Shield, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Logo & Brand */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Resumify</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Build job-ready<br />resumes in minutes
            </h1>
            
            <p className="text-lg text-blue-100 mb-12 leading-relaxed max-w-md">
              AI-powered resume creation, parsing, and customization. Stand out from the crowd with professional templates.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Lightning-fast resume builder' },
                { icon: Sparkles, text: 'AI-powered content suggestions' },
                { icon: Shield, text: 'ATS-friendly templates' },
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 text-blue-50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-blue-200">
            © 2025 Resumify. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
