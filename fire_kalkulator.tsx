import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function App() {
  // Input states med standardverdier
  const [currentBalance, setCurrentBalance] = useState(500000);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [monthlySavings, setMonthlySavings] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(6);

  // Faste variabler
  const currentAge = 34;
  const endAge = 70;

  // Hovedkalkulasjon - oppdateres automatisk når inputs endres
  const calcResults = useMemo(() => {
    // 1 & 2: Levekostnader
    const monthlyLivingCost = monthlyIncome - monthlySavings;
    const annualLivingCost = monthlyLivingCost * 12;
    const annualSavings = monthlySavings * 12;
    
    // 3 & 4: Uttaksbehov
    const annualWithdrawal50 = annualLivingCost / 2;
    const annualWithdrawal100 = annualLivingCost;

    const r = annualReturn / 100;
    
    let age50 = null;
    let age100 = null;
    
    // Algoritme for å finne tidligste alder for 50% og 100%
    for (let age = currentAge; age <= endAge; age++) {
      const yearsSaving = age - currentAge;
      const yearsWithdrawal = endAge - age;
      
      let capital = currentBalance;
      
      // Beregn oppspart kapital frem til alder X
      if (yearsSaving > 0) {
        if (r === 0) {
          capital += annualSavings * yearsSaving;
        } else {
          capital = currentBalance * Math.pow(1 + r, yearsSaving) + 
                    annualSavings * ((Math.pow(1 + r, yearsSaving) - 1) / r);
        }
      }

      // Beregn nødvendig kapital for å dekke uttak fra alder X til 70
      let req50 = 0;
      let req100 = 0;
      
      if (yearsWithdrawal > 0) {
        if (r === 0) {
          req50 = annualWithdrawal50 * yearsWithdrawal;
          req100 = annualWithdrawal100 * yearsWithdrawal;
        } else {
          // Nåverdi av en annuitet for å beregne nødvendig pott
          req50 = annualWithdrawal50 * ((1 - Math.pow(1 + r, -yearsWithdrawal)) / r);
          req100 = annualWithdrawal100 * ((1 - Math.pow(1 + r, -yearsWithdrawal)) / r);
        }
      }

      // Finn første alder hvor potten er stor nok
      if (age50 === null && capital >= req50) {
        age50 = age;
      }
      if (age100 === null && capital >= req100) {
        age100 = age;
      }
    }

    // Generer data for grafen basert på 100% FIRE scenario
    const chartData = [];
    let simBalance = currentBalance;
    const actualFireAge = age100 || endAge; // Hvis ikke oppnåelig, sett til 70

    for (let age = currentAge; age <= endAge; age++) {
      chartData.push({
        age,
        balance: Math.max(0, Math.round(simBalance))
      });
      
      // Oppdater saldo for neste år
      if (age < endAge) {
        if (age < actualFireAge) {
          // Sparefase
          simBalance = simBalance * (1 + r) + annualSavings;
        } else {
          // Uttaksfase (100% FIRE)
          simBalance = simBalance * (1 + r) - annualWithdrawal100;
        }
      }
    }

    return {
      monthlyLivingCost,
      annualWithdrawal50,
      annualWithdrawal100,
      age50,
      age100,
      chartData
    };
  }, [currentBalance, monthlyIncome, monthlySavings, annualReturn]);

  const formatNOK = (value) => {
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2">
            FIRE-kalkulator: Avslutt på 70
          </h1>
          <p className="text-slate-400 text-lg">
            Finn ut nøyaktig når du kan trappe ned til 50% eller pensjonere deg helt, med plan om å tømme fondet ved alder 70.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Venstre kolonne: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-6 text-slate-200">Dine forutsetninger</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nåværende fondsbalanse (NOK)</label>
                  <input 
                    type="number" 
                    value={currentBalance} 
                    onChange={(e) => setCurrentBalance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Månedlig inntekt (NOK)</label>
                  <input 
                    type="number" 
                    value={monthlyIncome} 
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Månedlig sparing (NOK)</label>
                  <input 
                    type="number" 
                    value={monthlySavings} 
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-400">Forventet årlig avkastning</label>
                    <span className="text-sm font-bold text-teal-400">{annualReturn}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" 
                    max="10" 
                    step="0.1"
                    value={annualReturn} 
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                    className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>3%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasjonsboks */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
               <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Levekostnader per måned</h3>
               <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                   <span className="text-slate-300">Nåværende (100%)</span>
                   <span className="font-mono text-lg text-white">{formatNOK(calcResults.monthlyLivingCost)}</span>
                 </div>
                 <div className="flex justify-between items-center pb-1">
                   <span className="text-slate-300">Dekkes fra fond ved 50%</span>
                   <span className="font-mono text-lg text-white">{formatNOK(calcResults.monthlyLivingCost / 2)}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Høyre kolonne: Resultater og Graf */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Resultatkort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="text-slate-400 font-medium text-lg mb-2">Du kan jobbe 50% fra alder</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-white">
                    {calcResults.age50 ? calcResults.age50 : "70+"}
                  </span>
                  <span className="text-slate-400 text-lg">år</span>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Tar ut {formatNOK(calcResults.annualWithdrawal50)} årlig
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-900/40 to-blue-900/40 border border-teal-800/50 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 className="text-teal-100 font-medium text-lg mb-2">Du kan ta 100% FIRE fra alder</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-teal-400">
                    {calcResults.age100 ? calcResults.age100 : "70+"}
                  </span>
                  <span className="text-teal-200/60 text-lg">år</span>
                </div>
                <p className="text-sm text-teal-200/50 mt-4">
                  Tar ut {formatNOK(calcResults.annualWithdrawal100)} årlig
                </p>
              </div>
            </div>

            {/* Graf */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-6 text-slate-200">Porteføljeutvikling (100% FIRE-scenario)</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={calcResults.chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="age" 
                      stroke="#64748b" 
                      tick={{ fill: '#64748b' }} 
                      tickFormatter={(value) => `${value} år`} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      tick={{ fill: '#64748b' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#2dd4bf' }}
                      formatter={(value) => [formatNOK(value), 'Saldo']}
                      labelFormatter={(label) => `Alder: ${label} år`}
                    />
                    
                    {calcResults.age100 && calcResults.age100 < 70 && (
                       <ReferenceLine 
                         x={calcResults.age100} 
                         stroke="#2dd4bf" 
                         strokeDasharray="3 3" 
                         label={{ position: 'top', value: '100% FIRE', fill: '#2dd4bf', fontSize: 12 }} 
                       />
                    )}

                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#2dd4bf" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#14b8a6', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs text-slate-500 mt-4">
                Grafen viser akkumulering av kapital frem til 100% FIRE-alder (hvis oppnåelig), deretter årlige uttak slik at fondet tømmes nøyaktig ved alder 70.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}