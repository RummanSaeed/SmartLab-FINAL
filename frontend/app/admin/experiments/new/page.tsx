"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Upload, Plus, X, Atom, Beaker, AlertTriangle, Brain, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function NewExperimentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    class: "",
    difficulty: "",
    duration: "",
    description: "",
    theory: "",
    objectives: [""],
    safetyNotes: [""],
    hazardEnabled: true,
    aiEnabled: true,
    gradingEnabled: false,
    variables: [{ name: "", min: "", max: "", default: "", unit: "" }],
  })

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Theory & Content", icon: Atom },
    { id: 3, title: "Safety Notes", icon: AlertTriangle },
    { id: 4, title: "Simulation Variables", icon: Settings },
    { id: 5, title: "AI & Rules Config", icon: Brain },
  ]

  const handleSave = () => {
    console.log("Saving experiment:", formData)
    router.push("/admin/dashboard")
  }

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ""] })
  }

  const addSafetyNote = () => {
    setFormData({ ...formData, safetyNotes: [...formData.safetyNotes, ""] })
  }

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, { name: "", min: "", max: "", default: "", unit: "" }],
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold">Create New Experiment</h1>
              <p className="text-sm text-muted-foreground">Add a new experiment to the library</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl mx-auto"
          >
            {currentStep === 1 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Experiment Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Ohm's Law Verification"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physics">
                            <div className="flex items-center gap-2">
                              <Atom className="w-4 h-4" />
                              Physics
                            </div>
                          </SelectItem>
                          <SelectItem value="Chemistry">
                            <div className="flex items-center gap-2">
                              <Beaker className="w-4 h-4" />
                              Chemistry
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) => setFormData({ ...formData, class: value })}
                      >
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                          <SelectItem value="11">Class 11</SelectItem>
                          <SelectItem value="12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <Input
                        placeholder="e.g., 30 min"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of the experiment..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-background/50 border-border/50 min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Theory & Learning Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theory Content</Label>
                    <Textarea
                      placeholder="Enter the theoretical background for this experiment..."
                      value={formData.theory}
                      onChange={(e) => setFormData({ ...formData, theory: e.target.value })}
                      className="bg-background/50 border-border/50 min-h-48"
                    />
                    <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Learning Objectives</Label>
                      <Button variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {formData.objectives.map((obj, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Objective ${index + 1}`}
                          value={obj}
                          onChange={(e) => {
                            const newObjectives = [...formData.objectives]
                            newObjectives[index] = e.target.value
                            setFormData({ ...formData, objectives: newObjectives })
                          }}
                          className="bg-background/50 border-border/50"
                        />
                        {formData.objectives.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newObjectives = formData.objectives.filter((_, i) => i !== index)
                              setFormData({ ...formData, objectives: newObjectives })
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Assets</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG, GLB, GLTF up to 10MB</p>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Safety Notes & Hazard Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-500">Important</p>
                        <p className="text-sm text-muted-foreground">
                          Safety notes will be shown to students before starting the experiment and during hazardous
                          operations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Safety Notes</Label>
                      <Button variant="outline" size="sm" onClick={addSafetyNote}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                    {formData.safetyNotes.map((note, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Safety note ${index + 1}`}
                          value={note}
                          onChange={(e) => {
                            const newNotes = [...formData.safetyNotes]
                            newNotes[index] = e.target.value
                            setFormData({ ...formData, safetyNotes: newNotes })
                          }}
                          className="bg-background/50 border-border/50"
                        />
                        {formData.safetyNotes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newNotes = formData.safetyNotes.filter((_, i) => i !== index)
                              setFormData({ ...formData, safetyNotes: newNotes })
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <p className="font-medium">Enable Hazard Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Allow students to proceed with dangerous setups (with warnings)
                      </p>
                    </div>
                    <Switch
                      checked={formData.hazardEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, hazardEnabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Simulation Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Define the variables that students can control in this experiment.
                  </p>

                  <div className="space-y-4">
                    {formData.variables.map((variable, index) => (
                      <Card key={index} className="bg-background/50 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline">Variable {index + 1}</Badge>
                            {formData.variables.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newVars = formData.variables.filter((_, i) => i !== index)
                                  setFormData({ ...formData, variables: newVars })
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                placeholder="e.g., Voltage"
                                value={variable.name}
                                onChange={(e) => {
                                  const newVars = [...formData.variables]
                                  newVars[index].name = e.target.value
                                  setFormData({ ...formData, variables: newVars })
                                }}
                                className="bg-background border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <Input
                                placeholder="e.g., V"
                                value={variable.unit}
                                onChange={(e) => {
                                  const newVars = [...formData.variables]
                                  newVars[index].unit = e.target.value
                                  setFormData({ ...formData, variables: newVars })
                                }}
                                className="bg-background border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Min Value</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variable.min}
                                onChange={(e) => {
                                  const newVars = [...formData.variables]
                                  newVars[index].min = e.target.value
                                  setFormData({ ...formData, variables: newVars })
                                }}
                                className="bg-background border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Value</Label>
                              <Input
                                type="number"
                                placeholder="100"
                                value={variable.max}
                                onChange={(e) => {
                                  const newVars = [...formData.variables]
                                  newVars[index].max = e.target.value
                                  setFormData({ ...formData, variables: newVars })
                                }}
                                className="bg-background border-border/50"
                              />
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label>Default Value</Label>
                              <Input
                                type="number"
                                placeholder="50"
                                value={variable.default}
                                onChange={(e) => {
                                  const newVars = [...formData.variables]
                                  newVars[index].default = e.target.value
                                  setFormData({ ...formData, variables: newVars })
                                }}
                                className="bg-background border-border/50"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addVariable} className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>AI & Rules Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">AI Tutor Integration</p>
                        <p className="text-sm text-muted-foreground">Enable AI-powered explanations and guidance</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.aiEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, aiEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <p className="font-medium">Grading Mode</p>
                      <p className="text-sm text-muted-foreground">Enable deterministic grading for assessments</p>
                    </div>
                    <Switch
                      checked={formData.gradingEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, gradingEnabled: checked })}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h4 className="font-medium mb-3">AI Tutor Context (Optional)</h4>
                    <Textarea
                      placeholder="Add specific context or instructions for the AI tutor when helping with this experiment..."
                      className="bg-background border-border/50 min-h-24"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h4 className="font-medium mb-3">Simulation Rules (JSON)</h4>
                    <Textarea
                      placeholder='{"maxVoltage": 20, "warningThreshold": 12, "explosionThreshold": 18}'
                      className="bg-background border-border/50 min-h-32 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Define custom rules for the simulation engine</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
              {currentStep < 5 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>Next Step</Button>
              ) : (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Experiment
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
