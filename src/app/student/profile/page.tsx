import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Heart, Lightbulb, ListChecks, Target, User, FileText } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const studentData = {
  name: "Charles Davis",
  id: "ST-2024-007",
  email: "charles.davis@example.com",
  grade: "11th Grade - A",
  avatar: "https://placehold.co/100x100.png",
};

const remedialPlans = [
  {
    id: "plan_1",
    planTitle: "Conquering Calculus!",
    subject: "Calculus",
    date: "2024-05-15",
    diagnosis: "Charles shows difficulty in understanding derivatives and their application in real-world problems. He often gets confused with the chain rule.",
    objectives: "1. Correctly apply the chain, product, and quotient rules.\n2. Solve at least 3 optimization problems correctly.\n3. Improve quiz scores on differentiation by 20%.",
    actionPlan: "- Review Khan Academy videos on derivatives (3 videos/week).\n- Complete 5 practice problems from the textbook daily.\n- Attend weekly tutoring sessions on Tuesdays.",
    recommendedResources: "- Khan Academy: https://www.khanacademy.org/math/differential-calculus\n- Paul's Online Math Notes: https://tutorial.math.lamar.edu/classes/calci/calci.aspx",
    motivationalMessage: "Charles, every great mathematician was once a beginner. Keep practicing, stay curious, and you'll master this. We believe in you!",
    status: "In Progress",
  },
  {
    id: "plan_2",
    planTitle: "Mastering Modernism",
    subject: "Art History",
    date: "2024-04-22",
    diagnosis: "The student struggles to differentiate between various modernist art movements and identify key artists and their works.",
    objectives: "Identify the key characteristics of Impressionism, Cubism, and Surrealism.",
    actionPlan: "1. Create a timeline of major art movements.\n2. Build a flashcard deck of 10 key artworks and artists.\n3. Visit a local museum's modern art section (if possible).",
    recommendedResources: "- MoMA Learning: https://www.moma.org/learn",
    motivationalMessage: "Art is a journey of discovery. Don't be afraid to get lost in the colors and shapes. You have a great eye for detail, use it!",
    status: "Completed",
  },
];

export default function StudentProfilePage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="My Profile"
        description="Your personal and academic information."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4" data-ai-hint="student avatar">
                <AvatarImage src={studentData.avatar} alt={studentData.name} />
                <AvatarFallback>{studentData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{studentData.name}</CardTitle>
              <CardDescription>{studentData.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Student ID</dt>
                  <dd className="font-medium">{studentData.id}</dd>
                </div>
                 <div className="flex justify-between">
                  <dt className="text-muted-foreground">Grade</dt>
                  <dd className="font-medium">{studentData.grade}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Remedial Plans</CardTitle>
                    <CardDescription>Action plans created by your teachers to help you succeed.</CardDescription>
                </CardHeader>
                <CardContent>
                    {remedialPlans.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {remedialPlans.map(plan => (
                                <AccordionItem value={plan.id} key={plan.id}>
                                    <AccordionTrigger>
                                        <div className="flex flex-col items-start text-left">
                                            <p className="font-semibold">{plan.planTitle}</p>
                                            <p className="text-sm text-muted-foreground">Subject: {plan.subject} | Date: {plan.date}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-6 pl-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">Status</h4>
                                                <Badge variant={plan.status === 'Completed' ? 'default' : 'secondary'}>{plan.status}</Badge>
                                            </div>
                                             <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Lightbulb className="h-5 w-5 text-accent" />
                                                    <h4 className="font-semibold">Diagnosis</h4>
                                                </div>
                                                <p className="text-muted-foreground text-sm">{plan.diagnosis}</p>
                                            </div>
                                             <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Target className="h-5 w-5 text-accent" />
                                                    <h4 className="font-semibold">Objectives</h4>
                                                </div>
                                                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{plan.objectives}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <ListChecks className="h-5 w-5 text-accent" />
                                                    <h4 className="font-semibold">Action Plan</h4>
                                                </div>
                                                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{plan.actionPlan}</p>
                                            </div>
                                             <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                                <div className="flex items-center gap-3">
                                                    <Heart className="h-5 w-5 text-primary" />
                                                    <h4 className="text-md font-semibold text-primary">Motivational Message</h4>
                                                </div>
                                                <p className="text-primary/80 text-sm">{plan.motivationalMessage}</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                You have no remedial plans at the moment. Keep up the great work!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
