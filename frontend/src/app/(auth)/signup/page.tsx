"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register, fetchProgramLevels, fetchPrograms, ProgramOption } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    program_level: "UNDERGRAD" as "UNDERGRAD" | "POSTGRAD",
    program: "",
    year_intake: "SEM1" as "SEM1" | "SEM2",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programLevels, setProgramLevels] = useState<{ value: string; label: string }[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  useEffect(() => {
    fetchProgramLevels().then(setProgramLevels).catch(console.error);
  }, []);

  useEffect(() => {
    fetchPrograms(form.program_level).then(setPrograms).catch(console.error);
  }, [form.program_level]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const tokens = await register(form);
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
      router.push("/");
    } catch (err) {
      setError("Sign up failed. Check inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
        </CardHeader>
        <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm mb-1 block">Username</label>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm mb-1 block">Email</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm mb-1 block">Password</label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm mb-1 block">Program level</label>
          <Select value={form.program_level} onValueChange={(v) => setForm({ ...form, program_level: v as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {programLevels.map((pl) => (
                <SelectItem key={pl.value} value={pl.value}>{pl.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm mb-1 block">Program</label>
          <Select value={form.program} onValueChange={(v) => setForm({ ...form, program: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-auto min-w-[300px]">
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.label}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm mb-1 block">Year intake</label>
          <Select value={form.year_intake} onValueChange={(v) => setForm({ ...form, year_intake: v as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Select intake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEM1">Semester 1</SelectItem>
              <SelectItem value="SEM2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account..." : "Create account"}</Button>
      </form>
        </CardContent>
      </Card>
    </div>
  );
}


