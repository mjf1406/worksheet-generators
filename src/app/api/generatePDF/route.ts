// import { type NextRequest, NextResponse } from 'next/server';
// import { PDFDocument } from 'pdf-lib';
// import { GRADE_FORM_URLS } from '~/lib/constants';
// import { downloadReportsBySemester } from '~/server/actions/downloadReportsBySemester';

// export async function POST(request: NextRequest) {
//   const { classId, semester, className, classYear, classGrade, sex } = await request.json();

//   try {
//     const data = await downloadReportsBySemester(classId, semester);
//     const pdfBuffer = await generatePDF(data[sex], semester, sex, className, classYear, classGrade);

//     return new NextResponse(pdfBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="${className}-${semester}-${sex}.pdf"`,
//       },
//     });
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     return NextResponse.json({ message: 'Error generating PDF' }, { status: 500 });
//   }
// }

// async function generatePDF(data, semester, sex, className, classYear, classGrade) {
//   // Move the PDF generation logic here
//   // This will be similar to your current printPDF function, but adapted for server-side use
//   const formUrl = GRADE_FORM_URLS[classGrade];
//   const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
//   const pdfDoc = await PDFDocument.load(formPdfBytes);
//   const form = pdfDoc.getForm();

//   const codeField = form.getTextField("Code");
//   codeField.setFontSize(8);

//   for (let index = 0; index < data.length; index++) {
//     const element = data[index];
//     const studentFields = element?.student_fields;
//     const studentLetter = studentLetters[index];
//     for (const prefixData of prefixArray) {
//       const name = prefixData?.name;
//       const prefix = prefixData?.prefix;

//       if (name === "comment") {
//         semesterAsNumberString = "1";
//         const field = form.getTextField(
//           `${prefix}${semesterAsNumberString}${studentLetter}`,
//         );
//         field.setFontSize(6);
//       } else semesterAsNumberString = semester.replace("s", "");
//       if (name.includes("_OJ")) {
//         const field = form.getTextField(`${prefix}OJ`);
//         field.setFontSize(6);
//         continue;
//       }
//       // if (prefix === "S Text") continue;

//       let fieldName = `${prefix}${semesterAsNumberString}${studentLetter}`; // Defaults to 21st Century Skills, Learner Traits, and Work Habits
//       if (prefix.includes("Text"))
//         fieldName = `${prefix}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
//       if (name.includes("_score"))
//         fieldName = `${prefix}${semesterAsNumberString}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
//       if (prefix === "Student " || prefix === "number ")
//         fieldName = `${prefix}${studentLetter}`; // For Student Name and Student Number
//       const field = form.getTextField(fieldName);

//       let textData = studentFields?.[name as keyof StudentField];
//       if (prefix === "Student " || prefix === "number ")
//         textData = element?.[name as keyof PDF] as string | undefined;
//       if (name.includes("_score")) {
//         textData = studentFields?.[
//           name.replace("_score", "") as keyof StudentField
//         ] as string;
//       }
//       let text;

//       if (typeof textData === "string" || textData instanceof String) {
//         text = textData as string;
//       } else if (
//         textData &&
//         typeof textData === "object" &&
//         semester in textData
//       ) {
//         if (name.includes("_score"))
//           text = textData[semester as keyof typeof textData] as
//             | string
//             | undefined;
//         else if (prefix.includes("Text"))
//           text = textData[`${semester}_comment` as keyof typeof textData] as
//             | string
//             | undefined;
//         else
//           text = textData[semester as keyof typeof textData] as
//             | string
//             | undefined;
//       } else {
//         text = "";
//       }

//       if (text !== undefined) {
//         field.setText(text);
//       }
//     }
//   }

//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes);
// }