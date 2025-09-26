import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database,
  Download,
  BarChart3,
  TrendingUp,
  FileText,
  Code,
  Calendar,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import tempoSatellite from "@/assets/tempo-satellite.jpg";

const DataExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("aqi");

  const datasets = [
    {
      name: "Air Quality Index (AQI)",
      id: "aqi",
      description: "Comprehensive air quality measurements across North America",
      size: "2.4 TB",
      updated: "2 minutes ago",
      format: "JSON, CSV, NetCDF"
    },
    {
      name: "TEMPO NO2 Measurements", 
      id: "no2",
      description: "Nitrogen dioxide concentrations from TEMPO satellite",
      size: "1.8 TB",
      updated: "5 minutes ago",
      format: "HDF5, NetCDF"
    },
    {
      name: "Ozone Column Data",
      id: "ozone", 
      description: "Atmospheric ozone measurements and vertical profiles",
      size: "1.2 TB",
      updated: "8 minutes ago",
      format: "NetCDF, JSON"
    },
    {
      name: "PM2.5 Surface Concentrations",
      id: "pm25",
      description: "Fine particulate matter surface-level measurements",
      size: "956 GB",
      updated: "3 minutes ago",
      format: "CSV, JSON"
    }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/v1/aqi/current",
      description: "Get current air quality index for a location",
      example: "?lat=37.7749&lon=-122.4194"
    },
    {
      method: "GET", 
      endpoint: "/api/v1/forecast/48h",
      description: "Get 48-hour air quality forecast",
      example: "?city=san-francisco"
    },
    {
      method: "GET",
      endpoint: "/api/v1/pollutants/historical",
      description: "Historical pollutant data with date range",
      example: "?start=2024-01-01&end=2024-12-31"
    },
    {
      method: "POST",
      endpoint: "/api/v1/alerts/subscribe", 
      description: "Subscribe to air quality alerts",
      example: "JSON payload with notification preferences"
    }
  ];

  const researchPapers = [
    {
      title: "TEMPO Mission: Advancing Atmospheric Science Through Geostationary Observations",
      authors: "NASA Goddard Space Flight Center",
      journal: "Atmospheric Measurement Techniques",
      year: "2024",
      doi: "10.5194/amt-2024-001"
    },
    {
      title: "Machine Learning Approaches for Air Quality Forecasting Using TEMPO Data",
      authors: "Smith, J. et al.",
      journal: "Environmental Science & Technology",
      year: "2024", 
      doi: "10.1021/acs.est.2024.example"
    },
    {
      title: "Health Impact Assessment of Air Quality Changes in Urban Areas",
      authors: "Johnson, M. et al.",
      journal: "Environmental Health Perspectives", 
      year: "2024",
      doi: "10.1289/EHP2024.example"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-4 py-2">
            <Database className="h-4 w-4 mr-2" />
            Scientific Data Platform
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Data Explorer & Science</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access comprehensive air quality datasets, research tools, and scientific methodology 
            powered by NASA's TEMPO satellite mission.
          </p>
        </div>

        <Tabs defaultValue="datasets" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="datasets">Live Datasets</TabsTrigger>
            <TabsTrigger value="api">API Documentation</TabsTrigger>
            <TabsTrigger value="research">Research Hub</TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
          </TabsList>

          {/* Live Datasets */}
          <TabsContent value="datasets" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Live Data Feeds</h2>
                <p className="text-muted-foreground">Real-time access to TEMPO satellite observations</p>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {datasets.map((dataset, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        <CardDescription className="mt-1">{dataset.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{dataset.format}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2 font-medium">{dataset.size}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="ml-2 font-medium">{dataset.updated}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Visualize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Documentation */}
          <TabsContent value="api" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">API Documentation</h2>
              <p className="text-muted-foreground">
                RESTful API access to real-time and historical air quality data
              </p>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Available Endpoints
                </CardTitle>
                <CardDescription>
                  Base URL: https://api.airvision-tempo.org/v1
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.endpoint}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Example:</span> {endpoint.example}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>API Key required for all requests:</p>
                    <code className="block bg-muted p-2 rounded text-xs">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  <Button size="sm" variant="outline">
                    Request API Key
                  </Button>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free Tier:</span>
                      <span className="font-medium">1,000 requests/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Research:</span>
                      <span className="font-medium">10,000 requests/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enterprise:</span>
                      <span className="font-medium">Unlimited</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Research Hub */}
          <TabsContent value="research" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Research Hub</h2>
              <p className="text-muted-foreground">
                Scientific publications and research tools for atmospheric science
              </p>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Publications
                </CardTitle>
                <CardDescription>
                  Peer-reviewed research using TEMPO data and AirVision platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {researchPapers.map((paper, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-2">
                    <h4 className="font-semibold text-foreground">{paper.title}</h4>
                    <p className="text-sm text-muted-foreground">{paper.authors}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {paper.journal} ({paper.year})
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Paper
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Data Analysis Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interactive tools for statistical analysis and visualization
                  </p>
                  <Button size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Launch Tools
                  </Button>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Collaboration Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with researchers and share datasets
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Join Research Network
                  </Button>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Citation Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate proper citations for TEMPO data usage
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Generate Citation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Methodology */}
          <TabsContent value="methodology" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Scientific Methodology</h2>
              <p className="text-muted-foreground">
                Learn about TEMPO mission technology and data processing methods
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
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
                  <p className="text-sm text-muted-foreground">
                    TEMPO (Tropospheric Emissions: Monitoring of Pollution) is NASA's first 
                    Earth Venture Instrument mission, providing unprecedented measurements 
                    of atmospheric pollution across North America.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Launch:</span>
                      <span>April 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Orbit:</span>
                      <span>Geostationary</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Coverage:</span>
                      <span>North America</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Resolution:</span>
                      <span>2.1 km × 4.4 km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Data Processing Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Raw Spectral Data</h4>
                        <p className="text-xs text-muted-foreground">UV-Visible spectrometer measurements</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Calibration & QC</h4>
                        <p className="text-xs text-muted-foreground">Instrument calibration and quality checks</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Atmospheric Retrieval</h4>
                        <p className="text-xs text-muted-foreground">Convert radiances to concentrations</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium">ML Enhancement</h4>
                        <p className="text-xs text-muted-foreground">Machine learning post-processing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-nasa flex items-center justify-center text-white text-sm font-bold">5</div>
                      <div>
                        <h4 className="font-medium">Public Distribution</h4>
                        <p className="text-xs text-muted-foreground">Real-time data dissemination</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle>Data Accuracy & Validation</CardTitle>
                <CardDescription>Quality assurance metrics and validation procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-data-accent">±5%</div>
                    <p className="text-sm text-muted-foreground">NO2 Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-data-primary">±8%</div>
                    <p className="text-sm text-muted-foreground">Ozone Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-data-secondary">96.7%</div>
                    <p className="text-sm text-muted-foreground">Data Availability</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">847</div>
                    <p className="text-sm text-muted-foreground">Ground Stations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataExplorer;