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

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

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
    display: "table",
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

const AssignerPDF = ({ data }: { data: AssignedData }) => {
  const keys = Object.keys(data.assignedData);
  const totalWidth = 100;
  const itemColWidth = 15;
  const numberColWidth = 10;
  const nameColWidth = 30;
  const keyWidth = numberColWidth + nameColWidth;

  const adjustedItemColWidth = totalWidth - keys.length * keyWidth;

  const allItems = Array.from(
    new Set(
      Object.values(data.assignedData).flatMap((items) =>
        items.map((item) => item.item),
      ),
    ),
  ).sort();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{data.name} Assigner</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View
              style={[styles.tableCol, { width: `${adjustedItemColWidth}%` }]}
            >
              <Text style={styles.tableCell}>{data.name}</Text>
            </View>
            {keys.map((key) => (
              <View
                key={key}
                style={[styles.tableCol, { width: `${keyWidth}%` }]}
              >
                <Text style={[styles.tableCell, styles.keyHeader]}>{key}</Text>
              </View>
            ))}
          </View>
          {/* Sub-header for student number and name */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View
              style={[styles.tableCol, { width: `${adjustedItemColWidth}%` }]}
            >
              <Text style={styles.tableCell}></Text>
            </View>
            {keys.flatMap((key) => [
              <View
                key={`${key}-number`}
                style={[styles.tableCol, { width: `${numberColWidth}%` }]}
              >
                <Text style={styles.tableCell}>Number</Text>
              </View>,
              <View
                key={`${key}-name`}
                style={[styles.tableCol, { width: `${nameColWidth}%` }]}
              >
                <Text style={styles.tableCell}>Name</Text>
              </View>,
            ])}
          </View>
          {/* Table Body */}
          {allItems.map((item) => (
            <View key={item} style={styles.tableRow}>
              <View
                style={[styles.tableCol, { width: `${adjustedItemColWidth}%` }]}
              >
                <Text style={styles.tableCell}>{item}</Text>
              </View>
              {keys.flatMap((key) => {
                const assignment = data.assignedData[key].find(
                  (a) => a.item === item,
                );
                return [
                  <View
                    key={`${key}-${item}-number`}
                    style={[styles.tableCol, { width: `${numberColWidth}%` }]}
                  >
                    <Text style={styles.tableCell}>
                      {assignment?.studentNumber || ""}
                    </Text>
                  </View>,
                  <View
                    key={`${key}-${item}-name`}
                    style={[styles.tableCol, { width: `${nameColWidth}%` }]}
                  >
                    <Text style={styles.tableCell}>
                      {assignment?.studentName || ""}
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

const PDFActions = ({ data }: { data: AssignedData }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const generatePdfBlob = async () => {
    const blob = await pdf(<AssignerPDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    setUrl(url);
    return url;
  };

  const handlePrint = async () => {
    const pdfUrl = url || (await generatePdfBlob());
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex space-x-4">
      <PDFDownloadLink
        document={<AssignerPDF data={data} />}
        fileName="assignment_results.pdf"
      >
        {({ blob, url, loading, error }) => (
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

export const PDFGenerator = ({ data }: { data: AssignedData }) => {
  return <PDFActions data={data} />;
};

type AssignmentItem = {
  item: string;
  studentNumber: string;
  studentName: string;
};

type AssignedData = {
  name: string;
  assignedData: {
    [key: string]: AssignmentItem[];
  };
};
