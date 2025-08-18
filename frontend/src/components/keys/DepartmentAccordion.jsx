import { useMemo } from "react";
import KeyCard from "./KeyCard";
import { ChevronRight, ChevronDown } from "lucide-react";

// Lightweight accordion (shadcn-like) implemented inline to avoid dependency wiring
const AccordionItem = ({ title, isOpen, onToggle, children, count }) => {
	return (
		<div className="border border-white/20 rounded-lg overflow-hidden bg-white/5">
			<button
				onClick={onToggle}
				className="w-full flex items-center justify-between px-4 py-3 text-left text-white hover:bg-white/10"
			>
				<div className="flex items-center gap-2">
					{isOpen ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
					<span className="font-medium">{title}</span>
				</div>
				{typeof count === "number" && (
					<span className="text-xs text-gray-300">{count}</span>
				)}
			</button>
			{isOpen && <div className="p-3 space-y-3">{children}</div>}
		</div>
	);
};

const matchesSearch = (key, query) => {
	if (!query.trim()) return true;
	const term = query.toLowerCase();
	return (
		key.keyName.toLowerCase().includes(term) ||
		String(key.keyNumber).toLowerCase().includes(term) ||
		(key.location || "").toLowerCase().includes(term)
	);
};

const applyAvailabilityFilter = (keys, filter) => {
	switch (filter) {
		case "available":
			return keys.filter((k) => k.status === "available");
		case "unavailable":
			return keys.filter((k) => k.status !== "available");
		case "favorites":
			return keys.filter((k) => k.frequentlyUsed);
		default:
			return keys;
	}
};

const groupByDepartment = (keys) => {
	const grouped = {};
	for (const key of keys) {
		const dept = key.category || "Other";
		if (!grouped[dept]) grouped[dept] = [];
		grouped[dept].push(key);
	}
	return grouped;
};

const DepartmentAccordion = ({
	keys,
	searchQuery,
	availabilityFilter,
	onRequestKey,
	onToggleFrequent,
	openState,
	setOpenState,
}) => {
	const grouped = useMemo(() => groupByDepartment(keys), [keys]);

	const departmentOrder = [
		"Computer Science",
		"Electronics",
		"Mechanical",
		"Civil",
		"Admin",
		...Object.keys(grouped).filter(
			(d) => !["Computer Science", "Electronics", "Mechanical", "Civil", "Admin"].includes(d)
		),
	];

	return (
		<div className="space-y-3">
			{departmentOrder
				.filter((dept, idx, arr) => arr.indexOf(dept) === idx)
				.map((dept) => {
					const list = grouped[dept] || [];
					const filteredBySearch = list.filter((k) => matchesSearch(k, searchQuery));
					const finalList = applyAvailabilityFilter(filteredBySearch, availabilityFilter);

					// Auto-open if search matches exist
					const isOpen = openState[dept] || (searchQuery.trim() && finalList.length > 0);
					const toggle = () => setOpenState((prev) => ({ ...prev, [dept]: !isOpen }));

					// Hide empty departments when a search is active
					if (searchQuery.trim() && finalList.length === 0) return null;

					return (
						<AccordionItem
							key={dept}
							title={`${dept} Department`}
							isOpen={isOpen}
							onToggle={toggle}
							count={finalList.length}
						>
							{finalList.length === 0 ? (
								<div className="text-sm text-gray-400 px-1 py-2">No keys</div>
							) : (
								finalList.map((key) => (
									<KeyCard
										key={key.id}
										keyData={key}
										variant="default"
										onRequestKey={onRequestKey}
										onToggleFrequent={onToggleFrequent}
									/>
								))
							)}
						</AccordionItem>
					);
				})}
		</div>
	);
};

export default DepartmentAccordion;



