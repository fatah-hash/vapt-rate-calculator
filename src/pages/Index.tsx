import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [targetScope, setTargetScope] = useState<string>("web");
  const [testingApproach, setTestingApproach] = useState("greybox");
  const [testerLevel, setTesterLevel] = useState("basic");
  const [endpoints, setEndpoints] = useState([100]);
  const [pentesters, setPentesters] = useState([1]);
  const [retests, setRetests] = useState([1]);

  // Pricing calculations based on man-days - varies by tester level
  const getManDayRate = (level: string) => {
    const rates: { [key: string]: number } = {
      basic: 1250000,       // Rp 1,250,000 per day
      intermediate: 1500000, // Rp 1,500,000 per day
      expert: 2000000,       // Rp 2,000,000 per day
    };
    return rates[level] || 1500000;
  };

  const MANDAY_RATE = getManDayRate(testerLevel);

  const targetCount = 1; // Always 1 since only one scope can be selected

  // Network scope calculations using reference table
  let scanningManDays: number;
  let manualTestingManDays: number;
  let scanningDaysPerPentester: number;
  let manualTestingCalendarDays: number;
  let effectiveEndpoints: number;

  if (targetScope === "network") {
    const deviceCount = endpoints[0];
    
    // Network testing formula:
    // Scanning: 255 devices per day per pentester
    // Manual testing: 20 devices per day per pentester
    
    // Calculate scanning days
    scanningDaysPerPentester = Math.ceil(deviceCount / 255);
    scanningManDays = scanningDaysPerPentester * pentesters[0];
    
    // Calculate manual testing days
    const manualTestingDaysBase = Math.ceil(deviceCount / 20);
    manualTestingManDays = manualTestingDaysBase;
    manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
    
    effectiveEndpoints = deviceCount;
  } else if (targetScope === "server") {
    // Server/Cloud Configuration scope - fixed days per testing approach
    // Always 1 server
    effectiveEndpoints = 1;
    
    // Fixed days based on testing approach
    if (testingApproach === "whitebox") {
      scanningDaysPerPentester = 1;
      const manualTestingDaysBase = 4;
      manualTestingManDays = manualTestingDaysBase;
      manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
    } else if (testingApproach === "greybox") {
      scanningDaysPerPentester = 2;
      const manualTestingDaysBase = 6;
      manualTestingManDays = manualTestingDaysBase;
      manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
    } else { // blackbox
      scanningDaysPerPentester = 2;
      const manualTestingDaysBase = 8;
      manualTestingManDays = manualTestingDaysBase;
      manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
    }
    
    scanningManDays = scanningDaysPerPentester * pentesters[0];
  } else {
    // Web/Mobile/Server scope calculations (existing logic)
    // Minimum endpoint calculation: below 50 endpoints = treated as 50 endpoints
    // White Box testing multiplies endpoints by 2
    const baseEndpoints = Math.max(endpoints[0], 50);
    effectiveEndpoints = testingApproach === "whitebox" ? baseEndpoints * 2 : baseEndpoints;

    // Black Box testing has fixed days, other approaches calculate based on endpoints
    const isBlackBox = testingApproach === "blackbox";
    
    // Calculate scanning days (increases with more pentesters)
    scanningDaysPerPentester = isBlackBox ? 3 : Math.ceil(effectiveEndpoints / 100);
    scanningManDays = scanningDaysPerPentester * pentesters[0];
    
    // Calculate manual testing days (decreases when divided among pentesters)
    const manualTestingDaysBase = isBlackBox ? 7 : Math.ceil(effectiveEndpoints / 25);
    manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
    manualTestingManDays = manualTestingDaysBase;
  }
  
  // Initial test days and man-days
  const initialTestCalendarDays = scanningDaysPerPentester + manualTestingCalendarDays;
  const initialTestManDays = scanningManDays + manualTestingManDays;
  
  // Generate initial report: 1 day for 1 target, or 2 days if > 300 endpoints (per target)
  const generateInitialReportDays = targetCount * (effectiveEndpoints > 300 ? 2 : 1);
  
  // Present: 1 day for max 5 targets
  const presentDays = Math.ceil(targetCount / 5);
  
  // Patching: fixed 5 days
  const patchingDays = 5;
  
  // Retest: same logic as initial test, but capped at 5 calendar days if > 5
  const retestCalendarDays = Math.min(initialTestCalendarDays, 5);
  const retestManDays = Math.min(initialTestManDays, 5 * pentesters[0]);
  
  // Generate retest report: same logic as initial report
  const generateRetestReportDays = targetCount * (effectiveEndpoints > 300 ? 2 : 1);
  
  // Kickoff: 1 day
  const kickoffDays = 1;

  // Calculate total man-days for initial phase
  const initialPhaseManDays = (
    kickoffDays +
    initialTestManDays +
    generateInitialReportDays +
    presentDays
  );

  // Calculate retest phase man-days (per retest)
  const retestPhaseManDays = (
    patchingDays +
    retestManDays +
    generateRetestReportDays
  );

  // Total man-days
  const totalManDays = initialPhaseManDays + (retestPhaseManDays * retests[0]);
  
  // Total duration (calendar days)
  const totalDuration = (
    kickoffDays +
    initialTestCalendarDays +
    generateInitialReportDays +
    presentDays +
    (retests[0] * (patchingDays + retestCalendarDays + generateRetestReportDays))
  );
  
  // Total cost
  const totalEstimate = totalManDays * MANDAY_RATE;

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const getSelectedScopes = () => {
    const scopes: { [key: string]: string } = {
      web: "Web Application",
      mobile: "Mobile App",
      network: "Network Infrastructure",
      server: "Server/Cloud Configuration",
    };
    return scopes[targetScope] || "-";
  };

  const getApproachLabel = (approach: string) => {
    const labels: { [key: string]: string } = {
      blackbox: "Black box",
      greybox: "Grey box",
      whitebox: "White box",
    };
    return labels[approach] || approach;
  };

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      basic: "Basic",
      intermediate: "Intermediate",
      expert: "Expert",
    };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--calculator-bg))] py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Kalkulator Harga Penetration Testing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Hitung estimasi biaya pengujian berdasarkan scope, pendekatan, level penguji, retest, dan timeline dalam Rupiah (IDR).
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Project Details */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Card className="bg-[hsl(var(--calculator-section))] border-border lg:h-full transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">1. Detail Proyek</h2>

                {/* Target Scope */}
                <div className="mb-4 sm:mb-6">
                  <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                    Target Scope (Lingkup Target) - Pilih Satu
                  </Label>
                  <RadioGroup value={targetScope} onValueChange={setTargetScope}>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 transition-all hover:bg-secondary/30 p-2 rounded-lg">
                        <RadioGroupItem value="web" id="web" />
                        <label htmlFor="web" className="text-xs sm:text-sm cursor-pointer flex-1">
                          Web Application (Aplikasi Web)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 transition-all hover:bg-secondary/30 p-2 rounded-lg">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <label htmlFor="mobile" className="text-xs sm:text-sm cursor-pointer flex-1">
                          Mobile App (Aplikasi Seluler)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 transition-all hover:bg-secondary/30 p-2 rounded-lg">
                        <RadioGroupItem value="network" id="network" />
                        <label htmlFor="network" className="text-xs sm:text-sm cursor-pointer flex-1">
                          Network Infrastructure (Infrastruktur Jaringan)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 transition-all hover:bg-secondary/30 p-2 rounded-lg">
                        <RadioGroupItem value="server" id="server" />
                        <label htmlFor="server" className="text-xs sm:text-sm cursor-pointer flex-1">
                          Server/Cloud Configuration (Konfigurasi Server/Cloud)
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Testing Approach */}
                <div className="mb-4 sm:mb-6">
                  <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                    Testing Approach (Pendekatan Tes)
                  </Label>
                  <Select value={testingApproach} onValueChange={setTestingApproach}>
                    <SelectTrigger className="w-full bg-background h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blackbox" className="text-sm sm:text-base">Black Box</SelectItem>
                      <SelectItem value="greybox" className="text-sm sm:text-base">Grey Box</SelectItem>
                      <SelectItem value="whitebox" className="text-sm sm:text-base">White Box (Akses Penuh Kode/Sistem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Level of Tester */}
                <div className="mb-4 sm:mb-6">
                  <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                    Level of Tester (Level Penguji)
                  </Label>
                  <Select value={testerLevel} onValueChange={setTesterLevel}>
                    <SelectTrigger className="w-full bg-background h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" className="text-sm sm:text-base">Basic testers</SelectItem>
                      <SelectItem value="intermediate" className="text-sm sm:text-base">Intermediate testers</SelectItem>
                      <SelectItem value="expert" className="text-sm sm:text-base">Expert testers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Endpoints / Devices */}
                {targetScope !== "server" && (
                  <div className="mb-4 sm:mb-6 animate-scale-in">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs sm:text-sm md:text-base font-semibold">
                        {targetScope === "network" 
                          ? "Jumlah Device pada Satu Segmen IP" 
                          : "Jumlah Halaman / Endpoint"
                        }
                      </Label>
                      <span className="text-xl sm:text-2xl font-bold text-primary">{endpoints[0]}</span>
                    </div>
                    <Slider
                      value={endpoints}
                      onValueChange={setEndpoints}
                      min={10}
                      max={targetScope === "network" ? 255 : 500}
                      step={10}
                      className={`my-3 sm:my-4 ${testingApproach === "blackbox" && targetScope !== "network" ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={testingApproach === "blackbox" && targetScope !== "network"}
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {targetScope === "network" ? (
                        "Rentang: 10 hingga 255 device (maksimal dalam satu segmen IP/24). Scanning: 255 device/hari/pentester. Manual Test: 20 device/hari/pentester."
                      ) : (
                        testingApproach === "blackbox" 
                          ? "Untuk Black Box testing, jumlah endpoint tidak mempengaruhi kalkulasi (fixed 10 hari: 3 scanning + 7 manual test)."
                          : "Rentang: 10 hingga 500 endpoint. Scanning: 100 endpoint/hari/pentester. Manual Test: 25 endpoint/hari/pentester."
                      )}
                    </p>
                  </div>
                )}

                {targetScope === "server" && (
                  <div className="mb-4 sm:mb-6 animate-scale-in">
                    <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                      Jumlah Server
                    </Label>
                    <div className="bg-secondary/30 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm">Default: <span className="font-bold text-primary">1 Server</span></p>
                      <p className="text-xs text-muted-foreground mt-2">
                        White box: 1 hari scanning + 4 hari manual test<br />
                        Grey box: 2 hari scanning + 6 hari manual test<br />
                        Black box: 2 hari scanning + 8 hari manual test
                      </p>
                    </div>
                  </div>
                )}

                {/* Number of Pentesters */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs sm:text-sm md:text-base font-semibold">
                      Jumlah Pentester
                    </Label>
                    <span className="text-xl sm:text-2xl font-bold text-primary">{pentesters[0]}</span>
                  </div>
                  <Slider
                    value={pentesters}
                    onValueChange={setPentesters}
                    min={1}
                    max={10}
                    step={1}
                    className="my-3 sm:my-4"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Jumlah pentester yang bekerja secara paralel pada fase testing.
                  </p>
                </div>

                {/* Number of Retests */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs sm:text-sm md:text-base font-semibold">
                      Jumlah Retest (Pengujian Ulang)
                    </Label>
                    <span className="text-xl sm:text-2xl font-bold text-primary">{retests[0]}</span>
                  </div>
                  <Slider
                    value={retests}
                    onValueChange={setRetests}
                    min={0}
                    max={5}
                    step={1}
                    className="my-3 sm:my-4"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Setiap retest mencakup: Patching (5 hari) + Retest + Generate Report.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cost Estimation */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="bg-[hsl(var(--calculator-section))] border-border lg:h-full transition-all duration-300 hover:shadow-lg sticky top-4">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">2. Hasil Estimasi</h2>

                <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Detail Iterasi & Timeline</h3>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="border-b border-border pb-2 sm:pb-3">
                      <h4 className="font-semibold text-xs sm:text-sm mb-2">FASE INITIAL TEST</h4>
                      <div className="space-y-1.5 sm:space-y-2 ml-1 sm:ml-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm">Kickoff:</span>
                          <span className="text-xs sm:text-sm font-medium">{kickoffDays} hari</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm">Initial Test ({pentesters[0]} pentester):</span>
                          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                            {targetScope === "network" 
                              ? `${initialTestCalendarDays} hari (${initialTestManDays} man-days)`
                              : `${initialTestCalendarDays} hari × ${pentesters[0]} Pentester = ${initialTestManDays} hari`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground ml-2 sm:ml-4">• Scanning:</span>
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {targetScope === "network"
                              ? `${scanningDaysPerPentester} hari × ${pentesters[0]} pentester = ${scanningManDays} hari`
                              : `${scanningDaysPerPentester} × ${pentesters[0]} = ${scanningManDays} hari`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground ml-2 sm:ml-4">• Manual Testing:</span>
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {targetScope === "network"
                              ? `${manualTestingManDays} hari ÷ ${pentesters[0]} pentester = ${manualTestingCalendarDays} hari`
                              : `${manualTestingManDays} ÷ ${pentesters[0]} = ${manualTestingCalendarDays} hari`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm">Generate Report:</span>
                          <span className="text-xs sm:text-sm font-medium">{generateInitialReportDays} hari</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm">Present:</span>
                          <span className="text-xs sm:text-sm font-medium">{presentDays} hari</span>
                        </div>
                        <div className="flex justify-between items-center font-semibold mt-2 pt-2 border-t border-border/50 gap-2">
                          <span className="text-xs sm:text-sm">Total Man-days:</span>
                          <span className="text-xs sm:text-sm">{initialPhaseManDays} hari</span>
                        </div>
                      </div>
                    </div>

                    {retests[0] > 0 && (
                      <div className="border-b border-border pb-2 sm:pb-3 animate-scale-in">
                        <h4 className="font-semibold text-xs sm:text-sm mb-2">FASE RETEST ({retests[0]}x)</h4>
                        <div className="space-y-1.5 sm:space-y-2 ml-1 sm:ml-2">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs sm:text-sm">Patching:</span>
                            <span className="text-xs sm:text-sm font-medium">{patchingDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs sm:text-sm">Retest ({pentesters[0]} pentester):</span>
                            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{retestCalendarDays} hari × {pentesters[0]} pentester = {retestManDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-xs sm:text-sm">Generate Report:</span>
                            <span className="text-xs sm:text-sm font-medium">{generateRetestReportDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center font-semibold mt-2 pt-2 border-t border-border/50 gap-2">
                            <span className="text-xs sm:text-sm">Per Retest:</span>
                            <span className="text-xs sm:text-sm">{retestPhaseManDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center font-semibold gap-2">
                            <span className="text-xs sm:text-sm">Total Retest:</span>
                            <span className="text-xs sm:text-sm">{retestPhaseManDays * retests[0]} hari</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
                        <span className="text-sm sm:text-base font-bold">Durasi Pengerjaan:</span>
                        <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">{totalDuration} hari</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
                        <span className="text-sm sm:text-base font-bold">TOTAL MAN-DAY ({pentesters[0]} pentester):</span>
                        <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">{totalManDays} hari</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground gap-2">
                        <span>Tarif Man-day:</span>
                        <span className="whitespace-nowrap">{formatCurrency(MANDAY_RATE)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="border-t-2 border-primary pt-3 sm:pt-4 animate-scale-in">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                    <span className="text-base sm:text-xl font-bold text-primary">TOTAL ESTIMASI</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">
                      {formatCurrency(totalEstimate)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    * Estimasi ini hanya simulasi dan tidak mengikat. Harga final dapat bervariasi tergantung pada hasil diskusi SOW (Scope of Work).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
