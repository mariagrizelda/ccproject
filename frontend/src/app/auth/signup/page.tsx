"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { register, fetchProgramLevels, fetchPrograms, ProgramOption } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    program_level: "UNDERGRAD" as "UNDERGRAD" | "POSTGRAD",
    program: "",
    program_id: "",
    year_intake: "SEM1" as "SEM1" | "SEM2",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programLevels, setProgramLevels] = useState<{ value: string; label: string }[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [programSearchOpen, setProgramSearchOpen] = useState(false);
  const [programSearchQuery, setProgramSearchQuery] = useState("");

  useEffect(() => {
    fetchProgramLevels().then(setProgramLevels).catch(console.error);
  }, []);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const fetchedPrograms = await fetchPrograms(form.program_level, programSearchQuery);
        setPrograms(fetchedPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(loadPrograms, 300);
    return () => clearTimeout(timeoutId);
  }, [form.program_level, programSearchQuery]);

  const selectedProgram = useMemo(() => {
    return programs.find(p => p.id.toString() === form.program_id);
  }, [programs, form.program_id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Use the program name instead of ID for registration
      const registrationData = {
        ...form,
        program: selectedProgram?.label || form.program
      };
      
      const tokens = await register(registrationData);
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
      document.cookie = `accessToken=${tokens.access}; path=/`;
      router.push("/");
      } catch (err) {
        setError("Sign up failed. Check inputs and try again:" + (err as Error).message);
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
          <label htmlFor="username" className="text-sm mb-1 block">Username</label>
          <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="email" className="text-sm mb-1 block">Email</label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="password" className="text-sm mb-1 block">Password</label>
          <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm mb-1 block">Program level</label>
          <Select value={form.program_level} onValueChange={(v) => setForm({ ...form, program_level: v as any, program_id: "", program: "" })}>
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
          <Popover open={programSearchOpen} onOpenChange={setProgramSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={programSearchOpen}
                className="w-full justify-between"
              >
                {selectedProgram ? selectedProgram.label : "Search for a program..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search programs..." 
                  value={programSearchQuery}
                  onValueChange={setProgramSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No programs found.</CommandEmpty>
                  <CommandGroup>
                    {programs.map((program) => (
                      <CommandItem
                        key={program.id}
                        value={program.label}
                        onSelect={() => {
                          setForm({ ...form, program_id: program.id.toString(), program: program.label });
                          setProgramSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            form.program_id === program.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {program.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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


