import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, ChevronLeft, ChevronRight, Clock, Video, BarChart2, HelpCircle, CheckCircle } from "lucide-react";
import CourseCreator from './CourseCreator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 6;

const fetchLessons = async () => {
  const response = await fetch('/lessons.json');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortTopic, setSortTopic] = useState('');
  const [sortLanguage, setSortLanguage] = useState('');
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
  });

  const filteredAndSortedLessons = useMemo(() => {
    if (!data) return [];
    
    let result = data.lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.topics.some((topic, index) => lesson.topics.includes(index) && topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortTopic && sortTopic !== 'all') {
      result = result.filter(lesson => lesson.topics.includes(parseInt(sortTopic)));
    }

    if (sortLanguage && sortLanguage !== 'all') {
      result = result.filter(lesson => lesson.availableLanguages.includes(parseInt(sortLanguage)));
    }

    return result;
  }, [data, searchTerm, sortTopic, sortLanguage]);

  const totalPages = Math.ceil((filteredAndSortedLessons?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLessons = filteredAndSortedLessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
          <Shield className="inline-block mr-2 h-10 w-10" />
          Cyber and Data Security Awareness
        </h1>
        
        <div className="mb-6 flex space-x-4 items-center">
          <Button onClick={() => setShowCourseCreator(!showCourseCreator)}>
            {showCourseCreator ? 'Hide Course Creator' : 'Create Custom Course'}
          </Button>
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Select value={sortTopic} onValueChange={setSortTopic}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {data.topics.map((topic, index) => (
                <SelectItem key={index} value={index.toString()}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortLanguage} onValueChange={setSortLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {data.languages.map((language, index) => (
                <SelectItem key={index} value={index.toString()}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCourseCreator && data && <CourseCreator lessons={data.lessons} topics={data.topics} />}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {paginatedLessons.map(lesson => (
            <Card key={lesson.lessonId} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{lesson.title}</CardTitle>
                <Checkbox
                  checked={selectedLessons[lesson.lessonId] || false}
                  onCheckedChange={(checked) => {
                    setSelectedLessons(prev => ({
                      ...prev,
                      [lesson.lessonId]: checked
                    }));
                  }}
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{lesson.description}</CardDescription>
                <img src={lesson.thumbImage} alt={lesson.title} className="w-full h-32 object-cover mb-4 rounded" />
                <div className="flex flex-wrap gap-2 mb-2">
                  {lesson.topics.map((topicIndex) => (
                    <Badge key={topicIndex} variant="secondary">{data.topics[topicIndex]}</Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <Clock className="inline-block mr-1 h-4 w-4" />
                  Time: {lesson.timeConsumption}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <Video className="inline-block mr-1 h-4 w-4" />
                  Video: {lesson.videoLength}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <BarChart2 className="inline-block mr-1 h-4 w-4" />
                  Difficulty: {lesson.difficultyLevel}
                </div>
                <div className="text-sm text-gray-600">
                  <HelpCircle className="inline-block mr-1 h-4 w-4" />
                  Number of quiz questions: {lesson.quizQuestions}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-gray-600">
                  Available in: {lesson.availableLanguages.map(langIndex => data.languages[langIndex]).join(", ")}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogTrigger asChild>
            <Button 
              className="mt-4"
              disabled={Object.values(selectedLessons).filter(Boolean).length === 0}
              onClick={() => setShowSummary(true)}
            >
              View Selected Lessons Summary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Selected Lessons Summary</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Total Time: {Object.entries(selectedLessons)
                  .filter(([_, isSelected]) => isSelected)
                  .reduce((total, [lessonId, _]) => {
                    const lesson = data.lessons.find(l => l.lessonId === lessonId);
                    return total + parseInt(lesson.timeConsumption);
                  }, 0)} minutes
              </h3>
              <p className="mb-4">
                You have selected {Object.values(selectedLessons).filter(Boolean).length} lesson{Object.values(selectedLessons).filter(Boolean).length !== 1 ? 's' : ''}. 
                Here's a summary of your selection:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(selectedLessons)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([lessonId, _]) => {
                    const lesson = data.lessons.find(l => l.lessonId === lessonId);
                    return (
                  <li key={lesson.lessonId}>
                    <strong>{lesson.title}</strong>
                    <ul className="list-none pl-5 space-y-1">
                      <li>Difficulty: {lesson.difficultyLevel}</li>
                      <li>Video Length: {lesson.videoLength}</li>
                      <li>Time Consumption: {lesson.timeConsumption}</li>
                      <li>Topics: {lesson.topics.map(topicIndex => data.topics[topicIndex]).join(', ')}</li>
                    </ul>
                  </li>
                    );
                  })}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
