import { useMemo } from "react";
import DepartmentCard from "./DepartmentCard";

const groupByDepartment = (keys) => {
	const grouped = {};
	for (const key of keys) {
		const dept = key.category || "Other";
		if (!grouped[dept]) grouped[dept] = [];
		grouped[dept].push(key);
	}
	return grouped;
};

const DepartmentsSection = ({ keys, onDepartmentClick, selectedDepartment }) => {
	const grouped = useMemo(() => groupByDepartment(keys), [keys]);

	// Sort departments by key count (descending)
	const sortedDepartments = Object.entries(grouped)
		.sort(([, a], [, b]) => b.length - a.length)
		.map(([department, departmentKeys]) => ({
			department,
			keyCount: departmentKeys.length
		}));

	return (
		<div className="mb-8">
			<h3 className="text-lg font-semibold text-white mb-4">Departments</h3>
			
			{sortedDepartments.length === 0 ? (
				<div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
					<p className="text-gray-400 text-lg">No departments found</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{sortedDepartments.map(({ department, keyCount }) => (
						<DepartmentCard
							key={department}
							department={department}
							keyCount={keyCount}
							onClick={() => onDepartmentClick(department)}
							isSelected={selectedDepartment === department}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default DepartmentsSection;
