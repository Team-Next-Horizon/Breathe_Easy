import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Satellite,
  Users,
  Brain,
  Database,
  Shield,
  Code,
  Globe,
  Award,
  Mail,
  Linkedin,
  ExternalLink,
  Github,
} from "lucide-react";
import tempoSatellite from "../assets/tempo-satellite.jpg";

const About = () => {
  const teamMembers = [
    {
      name: "Sourabh Upadhyay",
      role: "Full stack ",
      bio: "",
      expertise: ["TEMPO Mission", "Air Quality Modeling", "Remote Sensing"],
      image: "/team/emily.jpg"
    },
    {
      name: "Vivek singh Bhadoriya ",
      role: "Lead Software Engineer", 
      bio: "Full-stack developer specializing in geospatial applications",
      expertise: ["React/TypeScript", "GIS Systems", "Real-time Data"],
      image: "/team/alex.jpg"
    },
    {
      name: "Dheeraj Singh Bisht",
      role: "Public Health Researcher",
      bio: "Environmental health expert and community advocate",
      expertise: ["Health Impact Assessment", "Environmental Justice", "Policy"],
      image: "/team/marcus.jpg"
    },
    {
      name: "Uday Saini",
      role: "UX/UI Designer",
      bio: "Design professional focused on scientific data visualization",
      expertise: ["Data Visualization", "User Experience", "Accessibility"],
      image: "/team/sarah.jpg"
    },
    {
      name: "Udita Chaudhary",
      role: "Machine Learning Engineer", 
      bio: "AI/ML specialist with focus on environmental applications",
      expertise: ["Deep Learning", "Time Series", "Predictive Modeling"],
      image: "/team/robert.jpg"
    },
    {
      name: "Prakriti Adhikari",
      role: "Community Outreach Coordinator",
      bio: "Community engagement expert and environmental advocate",
      expertise: ["Community Building", "Education", "Advocacy"],
      image: "/team/jessica.jpg"
    }
  ];

  const partners = [
    { name: "NASA Goddard Space Flight Center", type: "Primary Partner" },
    { name: "EPA Office of Air Quality", type: "Regulatory Partner" },
    { name: "NOAA National Weather Service", type: "Data Partner" },
    { name: "Universities Space Research Association", type: "Research Partner" },
    { name: "American Lung Association", type: "Health Partner" }
  ];

  const techStack = [
    {
      category: "Frontend",
      technologies: ["React 18", "TypeScript", "Tailwind CSS", "Vite"]
    },
    {
      category: "Data Processing", 
      technologies: ["Python", "NumPy", "Pandas", "xarray", "Dask"]
    },
    {
      category: "Machine Learning",
      technologies: ["TensorFlow", "PyTorch", "Scikit-learn", "XGBoost"]
    },
    {
      category: "Geospatial",
      technologies: ["GDAL", "Rasterio", "PostGIS", "Mapbox GL JS"]
    },
    {
      category: "Infrastructure",
      technologies: ["AWS", "Docker", "Kubernetes", "Redis"]
    },
    {
      category: "APIs & Data",
      technologies: ["FastAPI", "PostgreSQL", "HDF5", "NetCDF"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-4 py-2">
            <Satellite className="h-4 w-4 mr-2" />
            About AirVision TEMPO
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Technology & Innovation for Cleaner Air</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn about our mission, the team behind AirVision TEMPO, and the cutting-edge technology 
            that makes real-time air quality intelligence possible.
          </p>
        </div>

        <Tabs defaultValue="mission" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mission">Mission & Vision</TabsTrigger>
            <TabsTrigger value="team">Our Team</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          </TabsList>

          {/* Mission & Vision */}
          <TabsContent value="mission" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Our Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      To democratize access to high-quality air pollution data and transform NASA's TEMPO satellite 
                      observations into actionable intelligence that empowers communities to protect their health 
                      and advocate for cleaner air.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Core Values:</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                          <span><strong>Accessibility:</strong> Making scientific data understandable for everyone</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                          <span><strong>Equity:</strong> Prioritizing environmental justice communities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                          <span><strong>Transparency:</strong> Open data, open source, open science</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                          <span><strong>Impact:</strong> Driving real-world positive change</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      NASA Space Apps Challenge 2025
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      AirVision TEMPO was developed for the NASA Space Apps Challenge 2025, addressing the challenge: 
                      "From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies."
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Challenge Goals Addressed:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Real-time processing of TEMPO satellite data</li>
                        <li>• Community-centered health protection tools</li>
                        <li>• Environmental justice and equity focus</li>
                        <li>• Predictive air quality forecasting</li>
                        <li>• Open science and data accessibility</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle>TEMPO Mission Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img 
                      src={tempoSatellite} 
                      alt="TEMPO Satellite" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <p className="text-muted-foreground text-sm">
                      NASA's TEMPO (Tropospheric Emissions: Monitoring of Pollution) is the first space-based 
                      instrument to provide hourly daytime measurements of air quality across North America.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Launch Date:</span>
                        <div className="text-muted-foreground">April 7, 2023</div>
                      </div>
                      <div>
                        <span className="font-medium">Mission Duration:</span>
                        <div className="text-muted-foreground">20+ years planned</div>
                      </div>
                      <div>
                        <span className="font-medium">Coverage Area:</span>
                        <div className="text-muted-foreground">North America</div>
                      </div>
                      <div>
                        <span className="font-medium">Resolution:</span>
                        <div className="text-muted-foreground">2.1 km × 4.4 km</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Learn More About TEMPO
                    </Button>
                  </CardContent>
                </Card>

                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle>Impact Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-data-primary">2.8M+</div>
                        <p className="text-sm text-muted-foreground">Data Points Processed</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-data-secondary">1,247</div>
                        <p className="text-sm text-muted-foreground">Cities Covered</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-data-accent">45,203</div>
                        <p className="text-sm text-muted-foreground">Health Alerts Sent</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">99.7%</div>
                        <p className="text-sm text-muted-foreground">System Uptime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Meet Our Team</h2>
              <p className="text-muted-foreground">
                Interdisciplinary experts passionate about air quality and public health
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-nasa mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Expertise:</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.expertise.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card bg-gradient-nasa text-white">
              <CardContent className="p-8 text-center space-y-4">
                <Users className="h-12 w-12 mx-auto opacity-90" />
                <h3 className="text-2xl font-bold">Join Our Mission</h3>
                <p className="text-lg opacity-90">
                  We're always looking for passionate individuals to join our team and help build 
                  a healthier future through technology and science.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary">
                    <Mail className="h-4 w-4 mr-2" />
                    View Open Positions
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Collaborate With Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technology */}
          <TabsContent value="technology" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Technical Architecture</h2>
              <p className="text-muted-foreground">
                Cutting-edge technology stack powering real-time air quality intelligence
              </p>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Pipeline Architecture
                </CardTitle>
                <CardDescription>
                  How we process and deliver TEMPO satellite data in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">1</div>
                      <h4 className="font-medium text-sm">TEMPO Satellite</h4>
                      <p className="text-xs text-muted-foreground">Raw spectral data</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">2</div>
                      <h4 className="font-medium text-sm">Data Ingestion</h4>
                      <p className="text-xs text-muted-foreground">Real-time processing</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">3</div>
                      <h4 className="font-medium text-sm">ML Processing</h4>
                      <p className="text-xs text-muted-foreground">AI enhancement</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">4</div>
                      <h4 className="font-medium text-sm">Quality Control</h4>
                      <p className="text-xs text-muted-foreground">Validation & QA</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">5</div>
                      <h4 className="font-medium text-sm">Public API</h4>
                      <p className="text-xs text-muted-foreground">Data distribution</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Key Performance Metrics:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-data-primary">&lt; 3 min</div>
                        <div className="text-muted-foreground">Data Latency</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-data-secondary">99.9%</div>
                        <div className="text-muted-foreground">API Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-data-accent">±5%</div>
                        <div className="text-muted-foreground">Data Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-primary">50TB/day</div>
                        <div className="text-muted-foreground">Data Volume</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((category, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="mr-2 mb-2">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Machine Learning Models
                </CardTitle>
                <CardDescription>
                  AI-powered forecasting and data enhancement algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Forecasting Models</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• LSTM Neural Networks</li>
                      <li>• Random Forest Ensembles</li>
                      <li>• Gradient Boosting (XGBoost)</li>
                      <li>• Transformer Architectures</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Data Enhancement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Spatial Interpolation</li>
                      <li>• Noise Reduction</li>
                      <li>• Gap Filling Algorithms</li>
                      <li>• Quality Assessment</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Real-time Processing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Stream Processing</li>
                      <li>• Anomaly Detection</li>
                      <li>• Alert Generation</li>
                      <li>• Auto-scaling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Open Source Commitment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  AirVision TEMPO is committed to open science and open source development. 
                  Our code, models, and methodologies are freely available for the scientific community.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline">
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    API Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partnerships */}
          <TabsContent value="partnerships" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Strategic Partnerships</h2>
              <p className="text-muted-foreground">
                Collaborating with leading organizations to maximize impact
              </p>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Key Partners
                </CardTitle>
                <CardDescription>
                  Organizations supporting our mission for cleaner air
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.map((partner, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border border-border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{partner.name}</h4>
                        <p className="text-sm text-muted-foreground">{partner.type}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Research Collaborations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We actively collaborate with academic institutions and research organizations 
                    to advance air quality science and public health.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">University Research Network</h4>
                      <p className="text-xs text-muted-foreground">45+ universities worldwide</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">Joint Publications</h4>
                      <p className="text-xs text-muted-foreground">12 peer-reviewed papers in 2024</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">Data Sharing Agreements</h4>
                      <p className="text-xs text-muted-foreground">23 international partnerships</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Community Partnerships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Working directly with communities to ensure our platform serves real needs 
                    and drives meaningful environmental justice outcomes.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">Environmental Justice Organizations</h4>
                      <p className="text-xs text-muted-foreground">Supporting 34+ advocacy groups</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">Health Departments</h4>
                      <p className="text-xs text-muted-foreground">Integrated with 15+ local agencies</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-sm">Community Advisory Board</h4>
                      <p className="text-xs text-muted-foreground">Representatives from 12 cities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="nasa-card bg-gradient-nasa text-white">
              <CardContent className="p-8 text-center space-y-4">
                <Globe className="h-12 w-12 mx-auto opacity-90" />
                <h3 className="text-2xl font-bold">Partner With Us</h3>
                <p className="text-lg opacity-90">
                  Interested in collaborating? We're always looking for new partnerships 
                  to expand our impact and reach more communities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Partnerships Team
                  </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Partnership Opportunities
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;