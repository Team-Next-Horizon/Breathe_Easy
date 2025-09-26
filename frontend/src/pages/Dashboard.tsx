import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Wind,
  Eye,
  Activity,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  Layers,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const [selectedLayer, setSelectedLayer] = useState("aqi");
  const [timeRange, setTimeRange] = useState([0]);
  const [lastUpdated] = useState(new Date());

  const airQualityData = [
    { city: "San Francisco, CA", aqi: 42, level: "Good", color: "air-quality-good" },
    { city: "Los Angeles, CA", aqi: 87, level: "Moderate", color: "air-quality-moderate" },
    { city: "Phoenix, AZ", aqi: 134, level: "Unhealthy", color: "air-quality-unhealthy" },
    { city: "Denver, CO", aqi: 65, level: "Moderate", color: "air-quality-moderate" },
    { city: "Seattle, WA", aqi: 28, level: "Good", color: "air-quality-good" },
    { city: "Portland, OR", aqi: 45, level: "Good", color: "air-quality-good" },
  ];

  const pollutants = [
    { name: "PM2.5", value: "12.4", unit: "μg/m³", status: "Good", icon: Wind },
    { name: "NO2", value: "23.7", unit: "ppb", status: "Moderate", icon: Activity },
    { name: "Ozone", value: "0.065", unit: "ppm", status: "Good", icon: Eye },
    { name: "SO2", value: "5.2", unit: "ppb", status: "Good", icon: BarChart3 },
  ];

  const alerts = [
    {
      type: "warning",
      message: "Air quality expected to reach unhealthy levels in Phoenix area this afternoon",
      time: "2 hours ago",
    },
    {
      type: "info", 
      message: "Favorable wind patterns improving air quality across California",
      time: "4 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Real-Time Air Quality Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Live monitoring powered by NASA TEMPO satellite data
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Controls */}
            <Card className="nasa-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Interactive Air Quality Map
                    </CardTitle>
                    <CardDescription>
                      Real-time air quality visualization across North America
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4" />
                    <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aqi">Overall AQI</SelectItem>
                        <SelectItem value="pm25">PM2.5</SelectItem>
                        <SelectItem value="no2">NO2</SelectItem>
                        <SelectItem value="ozone">Ozone</SelectItem>
                        <SelectItem value="so2">SO2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mock Map Visualization */}
                <div className="h-[400px] bg-gradient-to-br from-air-good/20 via-air-moderate/20 to-air-unhealthy/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Interactive Map</h3>
                      <p className="text-muted-foreground">Real-time air quality visualization will be displayed here</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing {selectedLayer.toUpperCase()} data layer
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Slider */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Forecast Timeline</label>
                    <span className="text-sm text-muted-foreground">
                      +{timeRange[0]} hours
                    </span>
                  </div>
                  <Slider
                    value={timeRange}
                    onValueChange={setTimeRange}
                    max={48}
                    step={3}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Now</span>
                    <span>24h</span>
                    <span>48h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City Data */}
            <Card className="nasa-card">
              <CardHeader>
                <CardTitle>Major Cities</CardTitle>
                <CardDescription>Current air quality index across major metropolitan areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {airQualityData.map((city, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div>
                        <h4 className="font-medium text-foreground">{city.city}</h4>
                        <Badge className={city.color}>{city.level}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{city.aqi}</div>
                        <div className="text-xs text-muted-foreground">AQI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Conditions */}
            <Card className="nasa-card">
              <CardHeader>
                <CardTitle>Current Location</CardTitle>
                <CardDescription>San Francisco, CA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-air-good mb-2">42</div>
                  <Badge className="air-quality-good mb-2">Good</Badge>
                  <p className="text-sm text-muted-foreground">
                    Air quality is satisfactory for most people
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {pollutants.map((pollutant, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 text-center">
                      <pollutant.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm font-medium">{pollutant.name}</div>
                      <div className="text-xs text-muted-foreground">{pollutant.value} {pollutant.unit}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border">
                    <p className="text-sm text-foreground mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Weather Integration */}
            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2" />
                  Weather Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <span className="text-sm font-medium">72°F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Wind Speed</span>
                    <span className="text-sm font-medium">8 mph NW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Humidity</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pressure</span>
                    <span className="text-sm font-medium">30.12 inHg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Quality Indicators */}
        <Card className="nasa-card mt-8">
          <CardHeader>
            <CardTitle>Data Quality & Sources</CardTitle>
            <CardDescription>Real-time monitoring system status and data accuracy metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-data-accent">99.7%</div>
                <p className="text-sm text-muted-foreground">TEMPO Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-data-primary">±5%</div>
                <p className="text-sm text-muted-foreground">Data Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-data-secondary">2.3min</div>
                <p className="text-sm text-muted-foreground">Update Frequency</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">847</div>
                <p className="text-sm text-muted-foreground">Active Sensors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;