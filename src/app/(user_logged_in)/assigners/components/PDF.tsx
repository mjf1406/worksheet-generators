import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { Button } from "~/components/ui/button";
import { Download, Printer } from "lucide-react";

// Type definitions
export type AssignmentItem = {
  item: string;
  studentNumber: number | null;
  studentName: string;
  studentSex: "male" | "female" | null;
};

export type AssignedData = {
  name: string;
  assignedData: Record<string, AssignmentItem[]>;
};

// Font registration
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

// Emoji registration
Font.registerEmojiSource({
  format: "png",
  url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/",
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 10,
    fontFamily: "Roboto",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 5,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 2,
    fontSize: 16,
    textAlign: "center",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  keyHeader: {
    backgroundColor: "#e0e0e0",
  },
});

// AssignerPDF component
const AssignerPDF = ({ data }: { data: AssignedData }) => {
  console.log("🚀 ~ AssignerPDF ~ data:", data);
  const groups: string[] = Object.keys(data.assignedData);
  const jobColWidth = 20;
  const numberColWidth = 10;
  const nameColWidth = 30;
  const groupColWidth = numberColWidth + nameColWidth;

  // Step 1: Calculate the maximum number of occurrences for each item
  const itemCounts: Record<string, number> = {};

  for (const group of groups) {
    const assignments = data.assignedData[group] ?? [];
    const counts = assignments.reduce(
      (acc: Record<string, number>, assignment) => {
        acc[assignment.item] = (acc[assignment.item] ?? 0) + 1;
        return acc;
      },
      {},
    );
    for (const item in counts) {
      itemCounts[item] = Math.max(itemCounts[item] ?? 0, counts[item] ?? 0);
    }
  }

  // Step 2: Generate rows based on items and their occurrence index
  const rows: { item: string; index: number }[] = [];
  for (const item in itemCounts) {
    const count = itemCounts[item] ?? 0;
    for (let i = 0; i < count; i++) {
      rows.push({ item, index: i });
    }
  }

  // Step 3: Build a map for assignments per group, item, and index
  const groupItemsMap: Record<string, Record<string, AssignmentItem[]>> = {};

  for (const group of groups) {
    const assignments = data.assignedData[group] ?? [];
    const itemMap: Record<string, AssignmentItem[]> = {};

    for (const assignment of assignments) {
      if (!itemMap[assignment.item]) {
        itemMap[assignment.item] = [];
      }
      itemMap[assignment.item]!.push(assignment);
    }

    groupItemsMap[group] = itemMap;
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{data.name}</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                styles.tableHeader,
                { width: `${jobColWidth}%` },
              ]}
            >
              <Text style={styles.tableCell}>{data.name}</Text>
            </View>
            {groups.map((group) => (
              <View
                key={group}
                style={[
                  styles.tableCol,
                  styles.keyHeader,
                  { width: `${groupColWidth}%` },
                ]}
              >
                <Text style={styles.tableCell}>{group}</Text>
              </View>
            ))}
          </View>
          {/* Sub-header for student number and name */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                styles.tableHeader,
                { width: `${jobColWidth}%` },
              ]}
            >
              <Text style={styles.tableCell}></Text>
            </View>
            {groups.flatMap((group) => [
              <View
                key={`${group}-number`}
                style={[
                  styles.tableCol,
                  styles.tableHeader,
                  { width: `${numberColWidth}%` },
                ]}
              >
                <Text style={styles.tableCell}>Number</Text>
              </View>,
              <View
                key={`${group}-name`}
                style={[
                  styles.tableCol,
                  styles.tableHeader,
                  { width: `${nameColWidth}%` },
                ]}
              >
                <Text style={styles.tableCell}>Name</Text>
              </View>,
            ])}
          </View>
          {/* Table Body */}
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: `${jobColWidth}%` }]}>
                <Text style={styles.tableCell}>{row.item}</Text>
              </View>
              {groups.flatMap((group) => {
                const itemMap = groupItemsMap[group]!; // Non-null assertion
                const assignmentsForItem = itemMap[row.item] ?? [];
                const assignment = assignmentsForItem[row.index];
                return [
                  <View
                    key={`${group}-${rowIndex}-number`}
                    style={[styles.tableCol, { width: `${numberColWidth}%` }]}
                  >
                    <Text style={styles.tableCell}>
                      {assignment?.studentNumber?.toString() ?? ""}
                    </Text>
                  </View>,
                  <View
                    key={`${group}-${rowIndex}-name`}
                    style={[styles.tableCol, { width: `${nameColWidth}%` }]}
                  >
                    <Text style={styles.tableCell}>
                      {assignment
                        ? `${assignment.studentName} (${assignment.studentSex?.charAt(
                            0,
                          )})`
                        : ""}
                    </Text>
                  </View>,
                ];
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// PDFActions component
const PDFActions = ({ data }: { data: AssignedData }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const generatePdfBlob = async () => {
    const blob = await pdf(<AssignerPDF data={data} />).toBlob();
    const newUrl = URL.createObjectURL(blob);
    setUrl(newUrl);
    return newUrl;
  };

  const handlePrint = async () => {
    const pdfUrl = url ?? (await generatePdfBlob());
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex space-x-4">
      <PDFDownloadLink
        document={<AssignerPDF data={data} />}
        fileName="assignment_results.pdf"
      >
        {({ loading }) => (
          <Button disabled={loading}>
            {loading ? (
              "Generating PDF..."
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" /> Download PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
      <Button onClick={handlePrint}>
        <Printer className="mr-2 h-5 w-5" /> Print PDF
      </Button>
    </div>
  );
};

// Main PDFGenerator component
export const PDFGenerator = ({ data }: { data: AssignedData }) => {
  return <PDFActions data={data} />;
};
