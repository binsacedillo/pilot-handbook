import Papa from "papaparse";

export interface FlightCSVRow {
  Date: string;
  Departure: string;
  Arrival: string;
  Duration: number;
  PIC: number;
  Dual: number;
  DayLandings: number;
  NightLandings: number;
  Remarks: string;
  Aircraft: string;
  Verified: string;
  Instructor: string;
}

interface FlightInput {
  date: Date | string;
  departureCode: string;
  arrivalCode: string;
  duration: number;
  picTime: number;
  dualTime: number;
  dayLandings: number;
  nightLandings: number;
  remarks?: string | null;
  aircraft?: { registration: string } | null;
  isVerified: boolean;
  instructorName?: string | null;
}

export const exportFlightsToCSV = (flights: FlightInput[]) => {
  const csvData: FlightCSVRow[] = flights.map((f) => ({
    Date: new Date(f.date).toLocaleDateString(),
    Departure: f.departureCode,
    Arrival: f.arrivalCode,
    Duration: f.duration,
    PIC: f.picTime,
    Dual: f.dualTime,
    DayLandings: f.dayLandings,
    NightLandings: f.nightLandings,
    Remarks: f.remarks || "",
    Aircraft: f.aircraft?.registration || "",
    Verified: f.isVerified ? "Yes" : "No",
    Instructor: f.instructorName || "",
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `flights_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseFlightsFromCSV = (file: File): Promise<Partial<FlightCSVRow>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<FlightCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};
