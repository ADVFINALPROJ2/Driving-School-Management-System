"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudent, updateStudent, type Student } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

const studentEditSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().min(1, "Middle name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  woreda: z.string().min(1, "Woreda is required"),
  subcity: z.string().optional(),
  kebele: z.string().optional(),
  house_number: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.string(),
  verified: z.boolean(),
});

type StudentEditValues = z.infer<typeof studentEditSchema>;

export default function StudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StudentEditValues>({
    resolver: zodResolver(studentEditSchema),
  });

  const studentId = Number(params.id);

  useEffect(() => {
    if (isNaN(studentId)) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      setLoading(true);
      const res = await getStudent(studentId);
      if (res.success && res.data) {
        setStudent(res.data);
        // Pre-fill form
        setValue("first_name", res.data.first_name);
        setValue("middle_name", res.data.middle_name);
        setValue("last_name", res.data.last_name);
        setValue("address", res.data.address);
        setValue("city", res.data.city);
        setValue("woreda", res.data.woreda);
        setValue("subcity", res.data.subcity || "");
        setValue("kebele", res.data.kebele || "");
        setValue("house_number", res.data.house_number || "");
        setValue("phone_number", res.data.phone_number || "");
        setValue("email", res.data.email || "");
        setValue("status", res.data.status);
        setValue("verified", res.data.verified);
      }
      setLoading(false);
    };

    fetchStudent();
  }, [studentId, setValue]);

  const onSubmit = async (data: StudentEditValues) => {
    setSubmitting(true);
    const res = await updateStudent(studentId, data);
    setSubmitting(false);

    if (res.success) {
      toast.success("Student updated successfully");
      router.push(`/students/${studentId}`);
    } else {
      toast.error(res.error || "Failed to update student");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading…</div>
=======
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudent, type Student } from "@/lib/api";
import { StudentForm } from "@/components/student-form";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getStudent(id).then((res) => {
      if (res.success && res.data) {
        setStudent(res.data);
      } else {
        setError(res.error || "Failed to load student");
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      </div>
    );
  }

<<<<<<< HEAD
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">Student not found</p>
        <Link href="/students">
          <Button variant="outline" className="mt-4">
            Back to Students
          </Button>
        </Link>
=======
  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500">{error || "Student not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/students">Back to Students</Link>
        </Button>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      </div>
    );
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/students/${studentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a]">
            Edit Student
          </h1>
          <p className="text-sm text-slate-500">{student.student_id}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-[#0f172a]">
            Personal Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && (
                <p className="text-xs text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name *</Label>
              <Input
                id="middle_name"
                {...register("middle_name")}
                className={errors.middle_name ? "border-red-500" : ""}
              />
              {errors.middle_name && (
                <p className="text-xs text-red-600">{errors.middle_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && (
                <p className="text-xs text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" {...register("phone_number")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                defaultValue={student.status}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="theory_in_progress">Theory in Progress</SelectItem>
                  <SelectItem value="practical_in_progress">Practical in Progress</SelectItem>
                  <SelectItem value="exam_eligible">Exam Eligible</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-[#0f172a]">
            Address Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="house_number">House Number</Label>
              <Input id="house_number" {...register("house_number")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kebele">Kebele</Label>
              <Input id="kebele" {...register("kebele")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="woreda">Woreda *</Label>
              <Input
                id="woreda"
                {...register("woreda")}
                className={errors.woreda ? "border-red-500" : ""}
              />
              {errors.woreda && (
                <p className="text-xs text-red-600">{errors.woreda.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcity">Subcity</Label>
              <Input id="subcity" {...register("subcity")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / Town *</Label>
              <Input
                id="city"
                {...register("city")}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-[#0f172a]">
            Verification Status
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="verified"
              {...register("verified")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="verified" className="cursor-pointer">
              Student is verified
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/students/${studentId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
=======
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/students/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0f172a]">
          Edit Student
        </h1>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs text-amber-600">
          Note: The backend PATCH /api/v1/students/:id route may not be implemented yet.
          If the update fails, check that the backend students controller includes the <code>:update</code> action.
        </p>
        <StudentForm
          initialData={student}
          onSuccess={() => router.push(`/students/${id}`)}
        />
      </div>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
    </div>
  );
}
