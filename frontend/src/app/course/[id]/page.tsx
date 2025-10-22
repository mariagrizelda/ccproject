"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BookOpen, Award, Calendar, Star, MessageSquare, Plus, User
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { Course } from "@/types/course";
import { fetchCourseDetails, fetchCourseReviews, submitCourseReview } from "@/lib/api";

type Assessment = {
  id: number;
  category: string;
  task: string;
  mode: string;
  grading_type: string;
  weight?: number | null;
  description: string;
  hurdle: boolean;
  hurdle_description?: string | null;
};

type ReviewItem = {
  id: number;
  review: number;            // 1–5
  description?: string;
  created_at: string;
  user: string;
};

type CourseDetails = Course & {
  assessments: Assessment[];
  reviews: ReviewItem[];
  average_rating: number;
  total_reviews: number;
  study_area: string;
  assessment_type: string;
  offered_sem_1: boolean;
  offered_sem_2: boolean;
  offered_summer: boolean;
  aim: string;
  prerequisites?: string[];
};

const levelBadge = (level?: number | string) => {
  const key = String(level ?? "");
  const map: Record<string,string> = {
    "1":"bg-green-500/10 text-green-700 dark:text-green-400",
    "2":"bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "3":"bg-purple-500/10 text-purple-700 dark:text-purple-400",
    "4":"bg-orange-500/10 text-orange-700 dark:text-orange-400",
    "100":"bg-green-500/10 text-green-700 dark:text-green-400",
    "200":"bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "300":"bg-purple-500/10 text-purple-700 dark:text-purple-400",
    "400":"bg-orange-500/10 text-orange-700 dark:text-orange-400",
  };
  return map[key] ?? "bg-secondary text-secondary-foreground";
};

function RatingStars({
  value,
  onChange,
  size = 16,
  interactive = false,
  className,
}: {
  value: number; onChange?: (v:number)=>void; size?: number; interactive?: boolean; className?: string;
}) {
  const stars = [1,2,3,4,5];
  if (!interactive) {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {stars.map(i => (
          <Star key={i} className={cn("shrink-0", i <= value ? "text-yellow-400 fill-current" : "text-muted-foreground/30")}
            style={{ width: size, height: size }} aria-hidden />
        ))}
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="radiogroup" aria-label="Rating">
      {stars.map(i => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i === value}
          onClick={() => onChange?.(i)}
          className="p-0.5 rounded hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={`${i} star${i>1?"s":""}`}
        >
          <Star className={cn(i <= value ? "text-yellow-400 fill-current" : "text-muted-foreground/30")}
            style={{ width: size, height: size }} aria-hidden />
        </button>
      ))}
    </div>
  );
}

export default function CourseProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDescription, setReviewDescription] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const courseId = Number(params?.id);

  useEffect(() => {
    // Check authentication status
    const token = typeof globalThis !== "undefined" && (globalThis as any).localStorage 
      ? localStorage.getItem("accessToken") 
      : null;
    setIsAuthenticated(!!token);

    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const c = await fetchCourseDetails(courseId);
        setCourse(c);
        try {
          setReviews(await fetchCourseReviews(courseId));
        } catch (e) {
          console.warn("reviews fetch failed", e);
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId]);

  async function handleSubmitReview() {
    try {
      setSubmittingReview(true);
      await submitCourseReview(courseId, reviewRating, reviewDescription);
      const [updatedReviews, updatedCourse] = await Promise.all([
        fetchCourseReviews(courseId),
        fetchCourseDetails(courseId),
      ]);
      setReviews(updatedReviews);
      setCourse(updatedCourse);
      setReviewDialogOpen(false);
      setReviewDescription("");
      setReviewRating(5);
      toast({ title: "Review submitted!", description: "Thanks for your feedback." });
    } catch (error: any) {
      console.error("Review submission error:", error);
      if (error.message === "unauthorized") {
        toast({ 
          title: "Please log in", 
          description: "You need to be logged in to submit a review.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Failed to submit review", 
          description: error.message || "Please try again later.", 
          variant: "destructive" 
        });
      }
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-86">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <span>Loading course…</span>
          </div>
        </div>
      </div>
    );
  }

  if (err || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">{err ?? "The course you’re looking for doesn’t exist."}</p>
          <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Button>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8">

        {/* Title block */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="secondary" className="font-mono text-sm px-2.5 py-1">{course.code}</Badge>
            <Badge className={cn(levelBadge(course.level), "text-sm px-2.5 py-1")}>
              Level {course.level}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{course.name}</h1>
          <p className="mt-2 text-muted-foreground max-w-5xl">{course.description}</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-4 text-center">
            <Award className="mx-auto mb-2 h-6 w-6 text-primary" />
            <div className="text-xl font-semibold">{course.credits}</div>
            <div className="text-xs text-muted-foreground">Credits</div>
          </CardContent></Card>

          <Card><CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-primary" />
            <div className="text-sm font-medium">{course.study_area}</div>
            <div className="text-xs text-muted-foreground">Study Area</div>
          </CardContent></Card>

          <Card><CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-2 h-6 w-6 text-primary" />
            <div className="text-sm font-medium">{course.assessment_type}</div>
            <div className="text-xs text-muted-foreground">Assessment</div>
          </CardContent></Card>

          <Card><CardContent className="p-4 text-center">
            <Star className="mx-auto mb-2 h-6 w-6 text-primary" />
            <div className="text-xl font-semibold">{course.average_rating?.toFixed?.(1) ?? "–"}</div>
            <div className="text-xs text-muted-foreground">{course.total_reviews} Reviews</div>
          </CardContent></Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Aim */}
            <Card>
              <CardHeader className="pb-3"><CardTitle>Course Aim</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed text-muted-foreground">{course.aim}</p></CardContent>
            </Card>

            {/* Prereqs */}
            {!!course.prerequisites?.length && (
              <Card>
                <CardHeader className="pb-3"><CardTitle>Prerequisites</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.prerequisites.map((p, i) => (
                      <Badge key={`${p}-${i}`} variant="outline">{p}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assessments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Assessments</CardTitle>
                <CardDescription>{course.assessments.length} item{course.assessments.length !== 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.assessments.map((a) => (
                  <div key={a.id} className="rounded-lg border p-4">
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="font-semibold">{a.task}</h4>
                      {typeof a.weight === "number" && (
                        <Badge variant="secondary" className="shrink-0">{a.weight}%</Badge>
                      )}
                    </div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      <div><span className="font-medium">Category:</span> {a.category}</div>
                      <div><span className="font-medium">Mode:</span> {a.mode}</div>
                      <div><span className="font-medium">Grading:</span> {a.grading_type}</div>
                    </div>
                    <p className="text-sm leading-relaxed">{a.description}</p>

                    {a.hurdle && (
                      <div className="mt-3 rounded-md border border-yellow-300/70 bg-yellow-50 p-3 dark:border-yellow-300/30 dark:bg-yellow-900/20">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Hurdle Requirement</p>
                        {a.hurdle_description && (
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">{a.hurdle_description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle>Course Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Offered Semesters</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.offered_sem_1 && <Badge variant="outline">Semester 1</Badge>}
                    {course.offered_sem_2 && <Badge variant="outline">Semester 2</Badge>}
                    {course.offered_summer && <Badge variant="outline">Summer</Badge>}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Study Area</h4>
                  <Badge variant="secondary">{course.study_area}</Badge>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Assessment Type</h4>
                  <Badge variant="secondary">{course.assessment_type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              {/* Make header a single row so the button fits nicely */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Reviews</CardTitle>
                  <span className="text-sm text-muted-foreground">({course.total_reviews})</span>
                </div>

                 {isAuthenticated ? (
                   <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                     <DialogTrigger asChild>
                       <Button size="sm" variant="outline" className="shrink-0">
                         <Plus className="mr-2 h-4 w-4" />
                         Add Review
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>Write a Review</DialogTitle>
                         <DialogDescription>Share your experience with this course.</DialogDescription>
                       </DialogHeader>

                       <div className="space-y-4">
                         <div>
                           <div className="text-sm font-medium">Rating</div>
                           <RatingStars
                             value={reviewRating}
                             onChange={setReviewRating}
                             size={22}
                             interactive
                             className="mt-2"
                           />
                         </div>

                         <div>
                           <div className="text-sm font-medium">Description (optional)</div>
                           <Textarea
                             value={reviewDescription}
                             onChange={(e) => setReviewDescription(e.target.value)}
                             placeholder="Share your thoughts…"
                             className="mt-2"
                             rows={4}
                           />
                         </div>
                       </div>

                       <DialogFooter>
                         <Button onClick={handleSubmitReview} disabled={submittingReview}>
                           {submittingReview ? "Submitting…" : "Submit Review"}
                         </Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                 ) : (
                   <Link href="/auth/login">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="shrink-0"
                     >
                       <Plus className="mr-2 h-4 w-4" />
                       Add Review
                     </Button>
                   </Link>
                 )}
              </CardHeader>

              <CardContent className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    {reviews.slice(0, 4).map((r) => (
                      <div key={r.id} className="rounded-md border p-3">
                         <div className="mb-1 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <RatingStars value={r.review} size={16} />
                             <span className="text-sm font-medium">{r.user || "Anonymous"}</span>
                           </div>
                           {/* created_at could be formatted if you like */}
                         </div>
                        {r.description && (
                          <p className="text-sm text-muted-foreground">{r.description}</p>
                        )}
                      </div>
                    ))}
                    {reviews.length > 4 && (
                      <p className="text-xs text-muted-foreground">+{reviews.length - 4} more review(s)</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
