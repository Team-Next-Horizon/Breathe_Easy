import { Link } from "react-router-dom";
import { Satellite, Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-nasa">
                <Satellite className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AirVision TEMPO</h3>
                <p className="text-sm text-muted-foreground">NASA Air Quality Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transforming NASA TEMPO satellite data into actionable air quality insights for healthier communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <nav className="space-y-2">
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Real-Time Dashboard
              </Link>
              <Link to="/data" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Data Explorer
              </Link>
              <Link to="/health" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Health Center
              </Link>
              <Link to="/community" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Community Hub
              </Link>
            </nav>
          </div>

          {/* NASA Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">NASA TEMPO</h4>
            <nav className="space-y-2">
              <a 
                href="https://tempo.si.edu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                TEMPO Mission <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <a 
                href="https://www.nasa.gov/earth/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                NASA Earth Science <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <a 
                href="https://earthdata.nasa.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                NASA Earthdata <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Technical Details
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <nav className="space-y-2">
              <a 
                href="mailto:contact@airvision-tempo.org" 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Team
              </a>
              <a 
                href="https://github.com/airvision-tempo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4 mr-2" />
                Open Source
              </a>
              <Link to="/community" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Join Community
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 AirVision TEMPO. Built for NASA Space Apps Challenge 2025.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span>Made with NASA TEMPO data</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;