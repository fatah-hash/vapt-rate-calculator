import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface TargetScope {
  web: boolean;
  mobile: boolean;
  network: boolean;
  server: boolean;
}

const Index = () => {
  const [targetScope, setTargetScope] = useState<TargetScope>({
    web: true,
    mobile: false,
    network: false,
    server: false,
  });
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

  // Minimum endpoint calculation: below 50 endpoints = treated as 50 endpoints
  const effectiveEndpoints = Math.max(endpoints[0], 50);

  const targetCount = Object.values(targetScope).filter(Boolean).length;

  // Black Box testing has fixed days, other approaches calculate based on endpoints
  const isBlackBox = testingApproach === "blackbox";
  
  // Calculate scanning days (increases with more pentesters)
  const scanningDaysPerPentester = isBlackBox ? 3 : Math.ceil(effectiveEndpoints / 100);
  const scanningManDays = scanningDaysPerPentester * pentesters[0];
  
  // Calculate manual testing days (decreases when divided among pentesters)
  const manualTestingDaysBase = isBlackBox ? 7 : Math.ceil(effectiveEndpoints / 25);
  const manualTestingCalendarDays = Math.ceil(manualTestingDaysBase / pentesters[0]);
  const manualTestingManDays = manualTestingDaysBase;
  
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
    const scopes = [];
    if (targetScope.web) scopes.push("Web");
    if (targetScope.mobile) scopes.push("Mobile");
    if (targetScope.network) scopes.push("Network");
    if (targetScope.server) scopes.push("Server/Cloud");
    return scopes.join(", ") || "-";
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
    <div className="min-h-screen bg-[hsl(var(--calculator-bg))] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Kalkulator Harga Penetration Testing
          </h1>
          <p className="text-muted-foreground text-lg">
            Hitung estimasi biaya pengujian berdasarkan scope, pendekatan, level penguji, retest, dan timeline dalam Rupiah (IDR).
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Project Details */}
          <div className="space-y-6">
            <Card className="bg-[hsl(var(--calculator-section))] border-border">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-primary mb-6">1. Detail Proyek</h2>

                {/* Target Scope */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">
                    Target Scope (Lingkup Target) - Pilih Satu atau Lebih
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="web"
                        checked={targetScope.web}
                        onCheckedChange={(checked) =>
                          setTargetScope({ ...targetScope, web: checked as boolean })
                        }
                      />
                      <label htmlFor="web" className="text-sm cursor-pointer">
                        Web Application (Aplikasi Web)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="mobile"
                        checked={targetScope.mobile}
                        onCheckedChange={(checked) =>
                          setTargetScope({ ...targetScope, mobile: checked as boolean })
                        }
                      />
                      <label htmlFor="mobile" className="text-sm cursor-pointer">
                        Mobile App (Aplikasi Seluler)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="network"
                        checked={targetScope.network}
                        onCheckedChange={(checked) =>
                          setTargetScope({ ...targetScope, network: checked as boolean })
                        }
                      />
                      <label htmlFor="network" className="text-sm cursor-pointer">
                        Network Infrastructure (Infrastruktur Jaringan)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="server"
                        checked={targetScope.server}
                        onCheckedChange={(checked) =>
                          setTargetScope({ ...targetScope, server: checked as boolean })
                        }
                      />
                      <label htmlFor="server" className="text-sm cursor-pointer">
                        Server/Cloud Configuration (Konfigurasi Server/Cloud)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Testing Approach */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">
                    Testing Approach (Pendekatan Tes)
                  </Label>
                  <Select value={testingApproach} onValueChange={setTestingApproach}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blackbox">Black Box</SelectItem>
                      <SelectItem value="greybox">Grey Box</SelectItem>
                      <SelectItem value="whitebox">White Box (Akses Penuh Kode/Sistem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Level of Tester */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">
                    Level of Tester (Level Penguji)
                  </Label>
                  <Select value={testerLevel} onValueChange={setTesterLevel}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic testers</SelectItem>
                      <SelectItem value="intermediate">Intermediate testers</SelectItem>
                      <SelectItem value="expert">Expert testers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Endpoints */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-semibold">
                      Jumlah Halaman / Endpoint
                    </Label>
                    <span className="text-2xl font-bold text-primary">{endpoints[0]}</span>
                  </div>
                  <Slider
                    value={endpoints}
                    onValueChange={setEndpoints}
                    min={10}
                    max={500}
                    step={10}
                    className={`my-4 ${testingApproach === "blackbox" ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={testingApproach === "blackbox"}
                  />
                  <p className="text-sm text-muted-foreground">
                    {testingApproach === "blackbox" 
                      ? "Untuk Black Box testing, jumlah endpoint tidak mempengaruhi kalkulasi (fixed 10 hari: 3 scanning + 7 manual test)."
                      : "Rentang: 10 hingga 500 endpoint. Scanning: 100 endpoint/hari. Manual Test: 25 endpoint/hari."
                    }
                  </p>
                </div>

                {/* Number of Pentesters */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-semibold">
                      Jumlah Pentester
                    </Label>
                    <span className="text-2xl font-bold text-primary">{pentesters[0]}</span>
                  </div>
                  <Slider
                    value={pentesters}
                    onValueChange={setPentesters}
                    min={1}
                    max={10}
                    step={1}
                    className="my-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    Jumlah pentester yang bekerja secara paralel pada fase testing.
                  </p>
                </div>

                {/* Number of Retests */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-semibold">
                      Jumlah Retest (Pengujian Ulang)
                    </Label>
                    <span className="text-2xl font-bold text-primary">{retests[0]}</span>
                  </div>
                  <Slider
                    value={retests}
                    onValueChange={setRetests}
                    min={0}
                    max={5}
                    step={1}
                    className="my-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    Setiap retest mencakup: Patching (5 hari) + Retest + Generate Report.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cost Estimation */}
          <div className="space-y-6">
            <Card className="bg-[hsl(var(--calculator-section))] border-border">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-primary mb-6">2. Hasil Estimasi</h2>

                <div className="bg-secondary/30 rounded-lg p-5 mb-6">
                  <h3 className="font-bold text-lg mb-4">Detail Iterasi & Timeline</h3>

                  <div className="space-y-3">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-semibold text-sm mb-2">FASE INITIAL TEST</h4>
                      <div className="space-y-2 ml-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Kickoff:</span>
                          <span className="text-sm font-medium">{kickoffDays} hari</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Initial Test (Scanning + Manual):</span>
                          <span className="text-sm font-medium">{initialTestCalendarDays} hari kerja = {initialTestManDays} man-days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground ml-4">• Scanning:</span>
                          <span className="text-sm text-muted-foreground">{scanningDaysPerPentester} hari × {pentesters[0]} = {scanningManDays} man-days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground ml-4">• Manual Testing:</span>
                          <span className="text-sm text-muted-foreground">{manualTestingDaysBase} hari ÷ {pentesters[0]} = {manualTestingCalendarDays} hari kerja</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Generate Initial Report:</span>
                          <span className="text-sm font-medium">{generateInitialReportDays} hari ({targetCount} target{targetCount > 1 ? 's' : ''})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Present:</span>
                          <span className="text-sm font-medium">{presentDays} hari</span>
                        </div>
                        <div className="flex justify-between items-center font-semibold mt-2 pt-2 border-t border-border/50">
                          <span className="text-sm">Total Man-days Initial:</span>
                          <span className="text-sm">{initialPhaseManDays} hari</span>
                        </div>
                      </div>
                    </div>

                    {retests[0] > 0 && (
                      <div className="border-b border-border pb-3">
                        <h4 className="font-semibold text-sm mb-2">FASE RETEST ({retests[0]}x)</h4>
                        <div className="space-y-2 ml-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Patching:</span>
                            <span className="text-sm font-medium">{patchingDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Retest:</span>
                            <span className="text-sm font-medium">{retestCalendarDays} hari kerja = {retestManDays} man-days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Generate Retest Report:</span>
                            <span className="text-sm font-medium">{generateRetestReportDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center font-semibold mt-2 pt-2 border-t border-border/50">
                            <span className="text-sm">Man-days per Retest:</span>
                            <span className="text-sm">{retestPhaseManDays} hari</span>
                          </div>
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-sm">Total Man-days Retest:</span>
                            <span className="text-sm">{retestPhaseManDays * retests[0]} hari</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-bold">Durasi Pengerjaan:</span>
                        <span className="text-xl font-bold text-primary">{totalDuration} hari kerja</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-bold">TOTAL MAN-DAY Dibayarkan:</span>
                        <span className="text-xl font-bold text-primary">{totalManDays} hari</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Tarif Man-day:</span>
                        <span>{formatCurrency(MANDAY_RATE)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="border-t-2 border-primary pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">TOTAL<br />ESTIMASI</span>
                    <span className="text-4xl font-bold text-primary">
                      {formatCurrency(totalEstimate)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
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
