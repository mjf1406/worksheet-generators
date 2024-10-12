
export default async function fetchClassesGroupsStudents() {
    const res = await fetch("/api/getClassesGroupsStudents");
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  }