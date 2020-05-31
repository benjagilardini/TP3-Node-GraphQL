const express = require("express");
const app = express();
const expressGraphQL = require("express-graphql");
const { GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require("graphql");

const _ = require("lodash");

const courses = require("./course.json");
const students = require("./student.json");
const grades = require("./grade.json");


const CourseType = new GraphQLObjectType({
    name: "Courses",
    description: "Represent courses",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
    })
});

const StudentType = new GraphQLObjectType({
    name: "Student",
    description: "Represent students",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        course: {
            type: CourseType,
            resolve: (student) => {
                return courses.find(course => course.id === student.courseId)
            }
        },
    }),
});

const GradeType = new GraphQLObjectType({
    name: "grades",
    description: "Represent grades",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        studentId: { type: GraphQLNonNull(GraphQLInt) },
        grade: { type: GraphQLNonNull(GraphQLInt) },
        student: {
            type: StudentType,
            resolve: (grade) => {
                return students.find(student => student.id === grade.studentId)
            }
        },
        course: {
            type: CourseType,
            resolve: (grade) => {
                return courses.find(course => course.id === grade.courseId)
            }
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addGrade: {
            type: GradeType,
            description: "Add a new grade",
            args: {
                courseId: { type: GraphQLNonNull(GraphQLInt) },
                studentId: { type: GraphQLNonNull(GraphQLInt) },
                grade: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                const grade = {
                    id: grades.length + 1,
                    courseId: args.courseId,
                    studentId: args.studentId,
                    grade: args.grade
                }
                grades.push(grade)
                return grade
            }
        },
        addStudent: {
            type: StudentType,
            description: "Add a new student",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                lastname: { type: GraphQLNonNull(GraphQLString) },
                courseId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                const student = {
                    id: students.length + 1,
                    name: args.name,
                    lastname: args.lastname,
                    courseId: args.courseId

                }
                students.push(student)
                return student
            }
        },
        addCourse: {
            type: CourseType,
            description: "Add a new course",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parents, args) => {
                const course = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                }
                courses.push(course)
                return course
            }
        },
        deleteCourse: {
            type: CourseType,
            description: "delete a course",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                _.remove(courses, (course) => {
                    return (course.id === args.id)
                })
            }
        },
        deleteStudent: {
            type: StudentType,
            description: "delete a student",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                _.remove(students, (student) => {
                    return (student.id === args.id)
                })
            }
        },
        deleteGrade: {
            type: GradeType,
            description: "delete a grade",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                _.remove(grades, (grade) => {
                    return (grade.id === args.id)
                })
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        students: {
            type: new GraphQLList(StudentType),
            description: "List of all students",
            resolve: () => students
        },
        courses: {
            type: new GraphQLList(CourseType),
            description: "List of all courses",
            resolve: () => courses
        },
        grades: {
            type: new GraphQLList(GradeType),
            description: "List of all grades",
            resolve: () => grades
        },
        student: {
            type: StudentType,
            description: "One student",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },
        course: {
            type: CourseType,
            description: "One course",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },
        grade: {
            type: GradeType,
            description: "One grade",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        }
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType

});

app.use(
    "/graphql",
    expressGraphQL({
        schema: schema,
        graphiql: true,
    })
);

app.listen(3030, () => {
    console.log("server running");
});
