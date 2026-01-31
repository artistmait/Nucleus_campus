import React, { useState } from "react";
import Table from "../../ui/ApprovalsTable";
import { Plus, Trash2 } from "lucide-react";

export default function KTTableWrapper() {
  const [rows, setRows] = useState([
    { no: "P1", field1: "", field2: "" },
  ]);

  const reindexRows = (data) =>
    data.map((row, index) => ({
      ...row,
      no: `P${index + 1}`,
    }));

  const addRow = () => {
    setRows((prev) =>
      reindexRows([
        ...prev,
        { no: "", field1: "", field2: "" },
      ])
    );
  };

  const deleteRow = (index) => {
    if (rows.length === 1) return; // always keep one row
    setRows((prev) => reindexRows(prev.filter((_, i) => i !== index)));
  };

  const updateCell = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [key]: value } : row
      )
    );
  };

  const columns = [
    {
      key: "no",
      header: "No.",
      className: "w-20",
    },
    {
      key: "sub_name",
      header: "Name of the Subject",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field1", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
    {
      key: "theory_marks",
      header: "Theory",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "tw_marks",
      header: "Term Work",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "ia_marks",
      header: "IA",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "oral_marks",
      header: "Orals",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "prac_marks",
      header: "Practical",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
     {
      key: "project_marks",
      header: "Project",
      render: (value, row) => {
        const index = rows.indexOf(row);
        return (
          <input
            value={value}
            onChange={(e) =>
              updateCell(index, "field2", e.target.value)
            }
            className="w-full border focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          />
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-16 text-center",
      render: (_, row) => {
        const index = rows.indexOf(row);
        const disabled = rows.length === 1;

        return (
          <button
            onClick={() => deleteRow(index)}
            disabled={disabled}
            className={`p-1 ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-600 hover:text-red-800"
            }`}
          >
            <Trash2 size={16} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={addRow}
          className="rounded-full bg-indigo-900 p-2 text-white hover:bg-indigo-800"
        >
          <Plus size={18} />
        </button>
      </div>

      <Table
        data={rows}
        columns={columns}
        searchPlaceholder="Search..."
      />
    </div>
  );
}
