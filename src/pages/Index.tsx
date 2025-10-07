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
  const [testingApproach, setTestingApproach] = useState("whitebox");
  const [testerLevel, setTesterLevel] = useState("basic");
  const [endpoints, setEndpoints] = useState([10]);
  const [retests, setRetests] = useState([1]);
  const [delivery, setDelivery] = useState("normal");

  // Pricing calculations
  const BASE_PRICE_PER_ENDPOINT = 300000;
  const RETEST_PRICE = 5000000;

  const scopeCount = Object.values(targetScope).filter(Boolean).length;
  const scopeMultiplier = scopeCount > 0 ? scopeCount * 0.5 + 0.5 : 1;

  const approachMultipliers: { [key: string]: number } = {
    blackbox: 1.0,
    greybox: 1.2,
    whitebox: 1.5,
  };

  const levelMultipliers: { [key: string]: number } = {
    basic: 1.0,
    intermediate: 1.5,
    expert: 2.0,
  };

  const baseEndpointCost = endpoints[0] * BASE_PRICE_PER_ENDPOINT;
  const approachMultiplier = approachMultipliers[testingApproach] || 1.0;
  const levelMultiplier = levelMultipliers[testerLevel] || 1.0;
  const totalFactorMultiplier = scopeMultiplier * approachMultiplier * levelMultiplier;

  const baseCostAfterFactors = Math.round(baseEndpointCost * totalFactorMultiplier);

  // Volume discount
  let volumeDiscount = 0;
  if (endpoints[0] >= 50 && endpoints[0] < 100) {
    volumeDiscount = baseCostAfterFactors * 0.1;
  } else if (endpoints[0] >= 100) {
    volumeDiscount = baseCostAfterFactors * 0.15;
  }

  const costAfterDiscount = baseCostAfterFactors - volumeDiscount;
  const retestCost = retests[0] * RETEST_PRICE;
  const totalEstimate = costAfterDiscount + retestCost;

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
                    max={200}
                    step={5}
                    className="my-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    Rentang: 10 hingga 200 endpoint. Biaya dasar dihitung per endpoint (Rp{BASE_PRICE_PER_ENDPOINT.toLocaleString("id-ID")}).
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
                    Biaya tetap per retest: Rp{RETEST_PRICE.toLocaleString("id-ID")}.
                  </p>
                </div>

                {/* Delivery Schedule */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-3 block">
                    Jadwal & Waktu Pengiriman
                  </Label>
                  <Select value={delivery} onValueChange={setDelivery}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Delivery</SelectItem>
                      <SelectItem value="express">Express Delivery (+20%)</SelectItem>
                      <SelectItem value="urgent">Urgent Delivery (+40%)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <h3 className="font-bold text-lg mb-4">Detail Perhitungan Biaya</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Biaya Endpoint Dasar
                        <br />
                        <span className="text-muted-foreground">({endpoints[0]} Endpoint):</span>
                      </span>
                      <span className="font-semibold">{formatCurrency(baseEndpointCost)}</span>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Target Scope:</span>
                        <span className="text-sm font-medium">{getSelectedScopes()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Faktor Pendekatan Tes:</span>
                        <span className="text-sm font-medium">{getApproachLabel(testingApproach)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Faktor Level Penguji:</span>
                        <span className="text-sm font-medium">{getLevelLabel(testerLevel)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">
                          Biaya Awal (Total Faktor: {totalFactorMultiplier.toFixed(2)}x):
                        </span>
                        <span className="font-bold">{formatCurrency(baseCostAfterFactors)}</span>
                      </div>
                    </div>

                    {volumeDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[hsl(var(--text-highlight))]">Diskon Volume:</span>
                        <span className="font-semibold text-[hsl(var(--text-highlight))]">
                          - {formatCurrency(volumeDiscount)}
                        </span>
                      </div>
                    )}

                    {volumeDiscount === 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[hsl(var(--text-highlight))]">Diskon Volume:</span>
                        <span className="font-semibold text-[hsl(var(--text-highlight))]">- Rp 0</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Biaya Setelah Diskon:</span>
                      <span className="font-bold">{formatCurrency(costAfterDiscount)}</span>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Delivery:</span>
                        <span className="text-sm font-medium text-primary">
                          {delivery === "normal" ? "Normal" : delivery === "express" ? "Express" : "Urgent"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Biaya Proyek Utama:</span>
                        <span className="font-bold">{formatCurrency(costAfterDiscount)}</span>
                      </div>
                    </div>

                    {retests[0] > 0 && (
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Jumlah Retest:</span>
                          <span className="text-sm font-bold text-[hsl(var(--text-highlight))]">
                            {retests[0]}X
                          </span>
                        </div>
                      </div>
                    )}
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
