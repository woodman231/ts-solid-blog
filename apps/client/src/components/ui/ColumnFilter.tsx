import { useState } from 'react';
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

// Filter types for different data types
export type FilterType = 'text' | 'number' | 'date' | 'lookup' | 'boolean';

export type TextFilterOperator = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals';
export type NumberFilterOperator = 'equals' | 'notEquals' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
export type DateFilterOperator = 'equals' | 'before' | 'after' | 'between';
export type LookupFilterOperator = 'in' | 'notIn';

export interface ColumnFilterConfig {
    type: FilterType;
    operators?: TextFilterOperator[] | NumberFilterOperator[] | DateFilterOperator[] | LookupFilterOperator[];
    lookupOptions?: Array<{ value: string; label: string }>; // For lookup columns
    lookupSearchable?: boolean; // Whether lookup supports search
    placeholder?: string;
}

export interface FilterValue {
    operator: string;
    value: any;
    value2?: any; // For 'between' operations
}

interface ColumnFilterProps {
    config: ColumnFilterConfig;
    value?: FilterValue;
    onChange: (filter: FilterValue | null) => void;
    header: string;
}

export function ColumnFilter({ config, value, onChange, header }: ColumnFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempOperator, setTempOperator] = useState(value?.operator || getDefaultOperator(config.type));
    const [tempValue, setTempValue] = useState(value?.value || '');
    const [tempValue2, setTempValue2] = useState(value?.value2 || '');

    const operators = config.operators || getDefaultOperators(config.type);

    const handleApply = () => {
        if (!tempValue && tempOperator !== 'in') {
            onChange(null);
        } else {
            onChange({
                operator: tempOperator,
                value: tempValue,
                value2: tempOperator === 'between' ? tempValue2 : undefined,
            });
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempOperator(getDefaultOperator(config.type));
        setTempValue('');
        setTempValue2('');
        onChange(null);
        setIsOpen(false);
    };

    const hasFilter = value && value.value !== '';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${hasFilter
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                <FunnelIcon className="h-3 w-3" />
                {hasFilter && (
                    <span className="bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        1
                    </span>
                )}
                <ChevronDownIcon className="h-3 w-3" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 z-50 min-w-64">
                    <div className="space-y-3">
                        <div className="font-medium text-sm text-gray-900">{header}</div>

                        {/* Operator Selection */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Filter Type
                            </label>
                            <select
                                value={tempOperator}
                                onChange={(e) => setTempOperator(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {operators.map((op) => (
                                    <option key={op} value={op}>
                                        {getOperatorLabel(op)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Value Input */}
                        {renderValueInput(config, tempOperator, tempValue, setTempValue, tempValue2, setTempValue2)}

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <button
                                onClick={handleClear}
                                className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                            >
                                Clear
                            </button>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderValueInput(
    config: ColumnFilterConfig,
    operator: string,
    value: any,
    setValue: (value: any) => void,
    value2: any,
    setValue2: (value: any) => void
) {
    switch (config.type) {
        case 'text':
            return (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value
                    </label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={config.placeholder || 'Enter text...'}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            );

        case 'number':
            return (
                <div className="space-y-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Value
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value ? parseFloat(e.target.value) : '')}
                            placeholder={config.placeholder || 'Enter number...'}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    {operator === 'between' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                To
                            </label>
                            <input
                                type="number"
                                value={value2}
                                onChange={(e) => setValue2(e.target.value ? parseFloat(e.target.value) : '')}
                                placeholder="Upper bound..."
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    )}
                </div>
            );

        case 'date':
            return (
                <div className="space-y-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    {operator === 'between' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={value2}
                                onChange={(e) => setValue2(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    )}
                </div>
            );

        case 'lookup':
            if (operator === 'in' || operator === 'notIn') {
                return (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Select Options
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded">
                            {config.lookupOptions?.map((option) => (
                                <label key={option.value} className="flex items-center px-2 py-1 hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(value) && value.includes(option.value)}
                                        onChange={(e) => {
                                            const currentValues = Array.isArray(value) ? value : [];
                                            if (e.target.checked) {
                                                setValue([...currentValues, option.value]);
                                            } else {
                                                setValue(currentValues.filter((v: any) => v !== option.value));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            }
            break;

        case 'boolean':
            return (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value
                    </label>
                    <select
                        value={value}
                        onChange={(e) => setValue(e.target.value === 'true')}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Any</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
            );

        default:
            return null;
    }
}

function getDefaultOperators(type: FilterType): string[] {
    switch (type) {
        case 'text':
            return ['contains', 'startsWith', 'endsWith', 'equals', 'notEquals'];
        case 'number':
            return ['equals', 'notEquals', 'gt', 'lt', 'gte', 'lte', 'between'];
        case 'date':
            return ['equals', 'before', 'after', 'between'];
        case 'lookup':
            return ['in', 'notIn'];
        case 'boolean':
            return ['equals'];
        default:
            return ['equals'];
    }
}

function getDefaultOperator(type: FilterType): string {
    switch (type) {
        case 'text':
            return 'contains';
        case 'number':
            return 'equals';
        case 'date':
            return 'equals';
        case 'lookup':
            return 'in';
        case 'boolean':
            return 'equals';
        default:
            return 'equals';
    }
}

function getOperatorLabel(operator: string): string {
    const labels: Record<string, string> = {
        contains: 'Contains',
        startsWith: 'Starts with',
        endsWith: 'Ends with',
        equals: 'Equals',
        notEquals: 'Not equals',
        gt: 'Greater than',
        lt: 'Less than',
        gte: 'Greater than or equal',
        lte: 'Less than or equal',
        between: 'Between',
        before: 'Before',
        after: 'After',
        in: 'In list',
        notIn: 'Not in list',
    };
    return labels[operator] || operator;
}
