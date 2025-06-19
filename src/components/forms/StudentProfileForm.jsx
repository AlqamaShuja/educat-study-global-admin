import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Tabs from "../ui/Tabs";

const StudentProfileForm = ({
  profile = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    defaultValues: {
      // Personal Info
      name: profile?.personalInfo?.name || "",
      email: profile?.personalInfo?.email || "",
      phone: profile?.personalInfo?.phone || "",
      dateOfBirth: profile?.personalInfo?.dateOfBirth || "",
      gender: profile?.personalInfo?.gender || "",
      nationality: profile?.personalInfo?.nationality || "",
      passportNumber: profile?.personalInfo?.passportNumber || "",
      address: profile?.personalInfo?.address || "",
      emergencyContact: profile?.personalInfo?.emergencyContact || "",

      // Educational Background
      educationalBackground: profile?.educationalBackground || [
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          grade: "",
          isCompleted: true,
        },
      ],

      // Test Scores
      ielts: profile?.testScores?.ielts || "",
      toefl: profile?.testScores?.toefl || "",
      sat: profile?.testScores?.sat || "",
      gre: profile?.testScores?.gre || "",
      gmat: profile?.testScores?.gmat || "",

      // Study Preferences
      preferredCountries: profile?.studyPreferences?.preferredCountries || [],
      preferredLevel: profile?.studyPreferences?.preferredLevel || "",
      preferredFields: profile?.studyPreferences?.preferredFields || [],
      budgetRange: profile?.studyPreferences?.budgetRange || "",
      intakePreference: profile?.studyPreferences?.intakePreference || "",

      // Work Experience
      workExperience: profile?.workExperience || [],

      // Financial Info
      familyIncome: profile?.financialInfo?.familyIncome || "",
      sponsorshipType: profile?.financialInfo?.sponsorshipType || "",
      bankBalance: profile?.financialInfo?.bankBalance || "",
    },
  });

  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "educationalBackground",
  });

  const {
    fields: workFields,
    append: addWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperience",
  });

  useEffect(() => {
    if (profile && mode === "edit") {
      reset({
        // Personal Info
        name: profile.personalInfo?.name || "",
        email: profile.personalInfo?.email || "",
        phone: profile.personalInfo?.phone || "",
        dateOfBirth: profile.personalInfo?.dateOfBirth || "",
        gender: profile.personalInfo?.gender || "",
        nationality: profile.personalInfo?.nationality || "",
        passportNumber: profile.personalInfo?.passportNumber || "",
        address: profile.personalInfo?.address || "",
        emergencyContact: profile.personalInfo?.emergencyContact || "",

        // Educational Background
        educationalBackground: profile.educationalBackground || [
          {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            grade: "",
            isCompleted: true,
          },
        ],

        // Test Scores
        ielts: profile.testScores?.ielts || "",
        toefl: profile.testScores?.toefl || "",
        sat: profile.testScores?.sat || "",
        gre: profile.testScores?.gre || "",
        gmat: profile.testScores?.gmat || "",

        // Study Preferences
        preferredCountries: profile.studyPreferences?.preferredCountries || [],
        preferredLevel: profile.studyPreferences?.preferredLevel || "",
        preferredFields: profile.studyPreferences?.preferredFields || [],
        budgetRange: profile.studyPreferences?.budgetRange || "",
        intakePreference: profile.studyPreferences?.intakePreference || "",

        // Work Experience
        workExperience: profile.workExperience || [],

        // Financial Info
        familyIncome: profile.financialInfo?.familyIncome || "",
        sponsorshipType: profile.financialInfo?.sponsorshipType || "",
        bankBalance: profile.financialInfo?.bankBalance || "",
      });
    }
  }, [profile, mode, reset]);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const degreeOptions = [
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate Degree" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "diploma", label: "Diploma" },
    { value: "certificate", label: "Certificate" },
  ];

  const countryOptions = [
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "Sweden", label: "Sweden" },
    { value: "France", label: "France" },
    { value: "Switzerland", label: "Switzerland" },
  ];

  const levelOptions = [
    { value: "undergraduate", label: "Undergraduate" },
    { value: "postgraduate", label: "Postgraduate" },
    { value: "phd", label: "PhD" },
    { value: "diploma", label: "Diploma" },
    { value: "certificate", label: "Certificate" },
  ];

  const fieldOptions = [
    { value: "engineering", label: "Engineering" },
    { value: "business", label: "Business" },
    { value: "computer_science", label: "Computer Science" },
    { value: "medicine", label: "Medicine" },
    { value: "arts", label: "Arts" },
    { value: "sciences", label: "Sciences" },
    { value: "law", label: "Law" },
    { value: "education", label: "Education" },
    { value: "psychology", label: "Psychology" },
    { value: "economics", label: "Economics" },
  ];

  const budgetOptions = [
    { value: "under_20k", label: "Under $20,000" },
    { value: "20k_40k", label: "$20,000 - $40,000" },
    { value: "40k_60k", label: "$40,000 - $60,000" },
    { value: "60k_80k", label: "$60,000 - $80,000" },
    { value: "over_80k", label: "Over $80,000" },
  ];

  const intakeOptions = [
    { value: "fall", label: "Fall" },
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "flexible", label: "Flexible" },
  ];

  const sponsorshipOptions = [
    { value: "self_funded", label: "Self Funded" },
    { value: "family_funded", label: "Family Funded" },
    { value: "scholarship", label: "Scholarship" },
    { value: "loan", label: "Education Loan" },
    { value: "employer_sponsored", label: "Employer Sponsored" },
  ];

  const onFormSubmit = (data) => {
    const formData = {
      personalInfo: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        passportNumber: data.passportNumber,
        address: data.address,
        emergencyContact: data.emergencyContact,
      },
      educationalBackground: data.educationalBackground,
      testScores: {
        ielts: data.ielts,
        toefl: data.toefl,
        sat: data.sat,
        gre: data.gre,
        gmat: data.gmat,
      },
      studyPreferences: {
        preferredCountries: data.preferredCountries,
        preferredLevel: data.preferredLevel,
        preferredFields: data.preferredFields,
        budgetRange: data.budgetRange,
        intakePreference: data.intakePreference,
      },
      workExperience: data.workExperience,
      financialInfo: {
        familyIncome: data.familyIncome,
        sponsorshipType: data.sponsorshipType,
        bankBalance: data.bankBalance,
      },
    };

    onSubmit(formData);
  };

  return (
    <Card title={`${mode === "create" ? "Create" : "Edit"} Student Profile`}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Tabs defaultTab={0}>
          {/* Personal Information Tab */}
          <Tabs.Panel label="Personal Info">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  {...register("name", { required: "Name is required" })}
                  error={errors.name?.message}
                  placeholder="Enter full name"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={errors.email?.message}
                  placeholder="Enter email address"
                  required
                />

                <Input
                  label="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  error={errors.phone?.message}
                  placeholder="Enter phone number"
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  {...register("dateOfBirth", {
                    required: "Date of birth is required",
                  })}
                  error={errors.dateOfBirth?.message}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <Select
                    options={genderOptions}
                    value={genderOptions.find(
                      (option) => option.value === watch("gender")
                    )}
                    onChange={(option) =>
                      setValue("gender", option?.value || "")
                    }
                    placeholder="Select gender"
                  />
                </div>

                <Input
                  label="Nationality"
                  {...register("nationality", {
                    required: "Nationality is required",
                  })}
                  error={errors.nationality?.message}
                  placeholder="Enter nationality"
                  required
                />

                <Input
                  label="Passport Number"
                  {...register("passportNumber")}
                  error={errors.passportNumber?.message}
                  placeholder="Enter passport number"
                />

                <Input
                  label="Emergency Contact"
                  {...register("emergencyContact")}
                  error={errors.emergencyContact?.message}
                  placeholder="Enter emergency contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  {...register("address")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </Tabs.Panel>

          {/* Educational Background Tab */}
          <Tabs.Panel label="Education">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Educational Background
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addEducation({
                      institution: "",
                      degree: "",
                      fieldOfStudy: "",
                      startDate: "",
                      endDate: "",
                      grade: "",
                      isCompleted: true,
                    })
                  }
                >
                  Add Education
                </Button>
              </div>

              {educationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-800">
                      Education {index + 1}
                    </h4>
                    {educationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Institution"
                      {...register(
                        `educationalBackground.${index}.institution`,
                        {
                          required: "Institution is required",
                        }
                      )}
                      error={
                        errors.educationalBackground?.[index]?.institution
                          ?.message
                      }
                      placeholder="Enter institution name"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <Select
                        options={degreeOptions}
                        value={degreeOptions.find(
                          (option) =>
                            option.value ===
                            watch(`educationalBackground.${index}.degree`)
                        )}
                        onChange={(option) =>
                          setValue(
                            `educationalBackground.${index}.degree`,
                            option?.value || ""
                          )
                        }
                        placeholder="Select degree"
                      />
                    </div>

                    <Input
                      label="Field of Study"
                      {...register(
                        `educationalBackground.${index}.fieldOfStudy`
                      )}
                      placeholder="Enter field of study"
                    />

                    <Input
                      label="Grade/GPA"
                      {...register(`educationalBackground.${index}.grade`)}
                      placeholder="Enter grade or GPA"
                    />

                    <Input
                      label="Start Date"
                      type="date"
                      {...register(`educationalBackground.${index}.startDate`)}
                    />

                    <Input
                      label="End Date"
                      type="date"
                      {...register(`educationalBackground.${index}.endDate`)}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(
                          `educationalBackground.${index}.isCompleted`
                        )}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Completed
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Panel>

          {/* Test Scores Tab */}
          <Tabs.Panel label="Test Scores">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                English Proficiency Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="IELTS Score"
                  {...register("ielts")}
                  placeholder="e.g., 7.5"
                />

                <Input
                  label="TOEFL Score"
                  {...register("toefl")}
                  placeholder="e.g., 100"
                />
              </div>

              <h3 className="text-lg font-medium text-gray-900">
                Standardized Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="SAT Score"
                  {...register("sat")}
                  placeholder="e.g., 1450"
                />

                <Input
                  label="GRE Score"
                  {...register("gre")}
                  placeholder="e.g., 320"
                />

                <Input
                  label="GMAT Score"
                  {...register("gmat")}
                  placeholder="e.g., 650"
                />
              </div>
            </div>
          </Tabs.Panel>

          {/* Study Preferences Tab */}
          <Tabs.Panel label="Study Preferences">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Countries
                  </label>
                  <Select
                    options={countryOptions}
                    value={countryOptions.filter((option) =>
                      watch("preferredCountries")?.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = Array.isArray(selectedOptions)
                        ? selectedOptions.map((opt) => opt.value)
                        : selectedOptions
                        ? [selectedOptions.value]
                        : [];
                      setValue("preferredCountries", values);
                    }}
                    placeholder="Select countries"
                    multiple
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Level
                  </label>
                  <Select
                    options={levelOptions}
                    value={levelOptions.find(
                      (option) => option.value === watch("preferredLevel")
                    )}
                    onChange={(option) =>
                      setValue("preferredLevel", option?.value || "")
                    }
                    placeholder="Select level"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Fields
                  </label>
                  <Select
                    options={fieldOptions}
                    value={fieldOptions.filter((option) =>
                      watch("preferredFields")?.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const values = Array.isArray(selectedOptions)
                        ? selectedOptions.map((opt) => opt.value)
                        : selectedOptions
                        ? [selectedOptions.value]
                        : [];
                      setValue("preferredFields", values);
                    }}
                    placeholder="Select fields"
                    multiple
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <Select
                    options={budgetOptions}
                    value={budgetOptions.find(
                      (option) => option.value === watch("budgetRange")
                    )}
                    onChange={(option) =>
                      setValue("budgetRange", option?.value || "")
                    }
                    placeholder="Select budget range"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intake Preference
                  </label>
                  <Select
                    options={intakeOptions}
                    value={intakeOptions.find(
                      (option) => option.value === watch("intakePreference")
                    )}
                    onChange={(option) =>
                      setValue("intakePreference", option?.value || "")
                    }
                    placeholder="Select intake"
                  />
                </div>
              </div>
            </div>
          </Tabs.Panel>

          {/* Financial Information Tab */}
          <Tabs.Panel label="Financial Info">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Family Annual Income (USD)"
                  type="number"
                  {...register("familyIncome")}
                  placeholder="Enter annual income"
                />

                <Input
                  label="Bank Balance (USD)"
                  type="number"
                  {...register("bankBalance")}
                  placeholder="Enter bank balance"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsorship Type
                  </label>
                  <Select
                    options={sponsorshipOptions}
                    value={sponsorshipOptions.find(
                      (option) => option.value === watch("sponsorshipType")
                    )}
                    onChange={(option) =>
                      setValue("sponsorshipType", option?.value || "")
                    }
                    placeholder="Select sponsorship type"
                  />
                </div>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {mode === "create" ? "Create Profile" : "Update Profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default StudentProfileForm;
