import { BloodPressureValue, VitalSign, VitalSigns } from "../types"
import { HealthResult, ResultColor, ResultStatus } from "../types/insightGenie"

function vs<T>(value: T | null | undefined): VitalSign<T> {
	if (value === null || value === undefined) {
		return { value: null, isEnabled: false }
	}
	return { value: value as T, isEnabled: true }
}

function pickFirstNumber(...candidates: any[]): number | null {
	for (const c of candidates) {
		if (typeof c === "number" && !isNaN(c)) return c
		if (typeof c === "string") {
			const parsed = parseFloat(c)
			if (!isNaN(parsed)) return parsed
		}
	}
	return null
}

function pickFirstObject(...candidates: any[]): any | null {
	for (const c of candidates) {
		if (c && typeof c === "object" && !Array.isArray(c)) return c
	}
	return null
}

interface HarvestedValue {
	key: string
	keyLower: string
	value: number
	path: string
	pathLower: string
}

function harvestNumericValues(
	obj: any,
	prefix: string,
	out: HarvestedValue[],
	seen: WeakSet<object>
) {
	if (!obj || typeof obj !== "object") return
	if (seen.has(obj)) return
	seen.add(obj)

	for (const [key, value] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${key}` : key

		if (typeof value === "number" && !isNaN(value)) {
			out.push({
				key,
				keyLower: key.toLowerCase(),
				value,
				path,
				pathLower: path.toLowerCase(),
			})
		} else if (typeof value === "string") {
			const parsed = parseFloat(value)
			if (!isNaN(parsed) && /^-?[0-9.,]+%?$/.test(value.trim())) {
				out.push({
					key,
					keyLower: key.toLowerCase(),
					value: parsed,
					path,
					pathLower: path.toLowerCase(),
				})
			}
		} else if (value && typeof value === "object" && !Array.isArray(value)) {
			harvestNumericValues(value, path, out, seen)
		}
	}
}

function findHarvested(
	harvest: HarvestedValue[],
	keyMatchers: ((m: HarvestedValue) => boolean)[]
): number | null {
	for (const matcher of keyMatchers) {
		for (const m of harvest) {
			if (matcher(m)) return m.value
		}
	}
	return null
}

function emptyVitalSigns(): VitalSigns {
	const empty = <T,>(): VitalSign<T> => ({ value: null, isEnabled: false })
	return {
		pulseRate: empty<number>(),
		respirationRate: empty<number>(),
		oxygenSaturation: empty<number>(),
		bloodPressure: empty<BloodPressureValue>(),
		sdnn: empty<number>(),
		rmssd: empty<number>(),
		sd1: empty<number>(),
		sd2: empty<number>(),
		meanRri: empty<number>(),
		rri: empty<number[]>(),
		lfhf: empty<number>(),
		stressLevel: empty<any>(),
		stressIndex: empty<number>(),
		normalizedStressIndex: empty<number>(),
		wellnessIndex: empty<number>(),
		snsIndex: empty<number>(),
		snsZone: empty<any>(),
		pnsIndex: empty<number>(),
		pnsZone: empty<any>(),
		prq: empty<number>(),
		heartAge: empty<number>(),
		hemoglobin: empty<number>(),
		hemoglobinA1c: empty<number>(),
		cardiacWorkload: empty<number>(),
		meanArterialPressure: empty<number>(),
		pulsePressure: empty<number>(),
		ascvdRisk: empty<number>(),
		highBloodPressureRisk: empty<any>(),
		highFastingGlucoseRisk: empty<any>(),
		highHemoglobinA1CRisk: empty<any>(),
		highTotalCholesterolRisk: empty<any>(),
		lowHemoglobinRisk: empty<any>(),
	}
}

function findResultRoot(message: any): any {
	if (!message || typeof message !== "object") return null
	const candidates = [
		message.analysisData,
		message.healthData,
		message.healthAnalysis,
		message.results,
		message.analysis,
		message.scanResults,
		message.payload,
		message.response,
		message.data,
		message,
	]
	for (const c of candidates) {
		if (
			c &&
			typeof c === "object" &&
			(c.vital_signs || c.vitalSigns || c.holistic_health || c.health_risks || c.scores)
		) {
			return c
		}
	}
	return message
}

function riskLevelFromPercent(percent: number | null): "Low" | "Medium" | "High" | null {
	if (percent === null) return null
	if (percent < 2) return "Low"
	if (percent < 5) return "Medium"
	return "High"
}

interface DeepMetrics {
	heartRate: number | null
	respiratoryRate: number | null
	spo2: number | null
	systolic: number | null
	diastolic: number | null
	sdnn: number | null
	rmssd: number | null
	chf: number | null
	chd: number | null
	stroke: number | null
	cvdGeneral: number | null
	stress: number | null
	wellness: number | null
	cardiacWorkload: number | null
	heartAge: number | null
	hemoglobin: number | null
	hemoglobinA1c: number | null
	meanRri: number | null
	lfhf: number | null
	ascvd: number | null
	hypertensionRisk: number | null
	diabetesRisk: number | null
}

function extractDeepMetrics(message: any): DeepMetrics {
	const harvest: HarvestedValue[] = []
	if (message && typeof message === "object") {
		harvestNumericValues(message, "", harvest, new WeakSet())
	}

	const has = (m: HarvestedValue, ...needles: string[]) =>
		needles.some(n => m.keyLower === n || m.pathLower.endsWith("." + n))
	const pathHas = (m: HarvestedValue, ...needles: string[]) =>
		needles.some(n => m.pathLower.includes(n))
	const keyContains = (m: HarvestedValue, ...needles: string[]) =>
		needles.some(n => m.keyLower.includes(n))

	const out: DeepMetrics = {
		heartRate: null,
		respiratoryRate: null,
		spo2: null,
		systolic: null,
		diastolic: null,
		sdnn: null,
		rmssd: null,
		chf: null,
		chd: null,
		stroke: null,
		cvdGeneral: null,
		stress: null,
		wellness: null,
		cardiacWorkload: null,
		heartAge: null,
		hemoglobin: null,
		hemoglobinA1c: null,
		meanRri: null,
		lfhf: null,
		ascvd: null,
		hypertensionRisk: null,
		diabetesRisk: null,
	}

	for (const m of harvest) {
		if (
			out.heartRate === null &&
			has(m, "heart_rate", "heartrate", "pulse_rate", "pulserate", "bpm", "hr")
		) {
			out.heartRate = m.value
			continue
		}
		if (
			out.respiratoryRate === null &&
			has(m, "respiratory_rate", "respiratoryrate", "respiration_rate", "respirationrate")
		) {
			out.respiratoryRate = m.value
			continue
		}
		if (
			out.spo2 === null &&
			has(m, "spo2", "oxygen_saturation", "oxygensaturation", "spo_2")
		) {
			out.spo2 = m.value
			continue
		}
		if (
			out.systolic === null &&
			(has(
				m,
				"systolic_bp",
				"systolicbp",
				"bp_systolic",
				"bpsystolic",
				"systolic",
				"systolicpressure",
				"systolic_pressure",
				"systolic_blood_pressure",
				"systolicbloodpressure"
			) ||
				(keyContains(m, "systolic") && !keyContains(m, "diastolic")))
		) {
			out.systolic = m.value
			continue
		}
		if (
			out.diastolic === null &&
			(has(
				m,
				"diastolic_bp",
				"diastolicbp",
				"bp_diastolic",
				"bpdiastolic",
				"diastolic",
				"diastolicpressure",
				"diastolic_pressure",
				"diastolic_blood_pressure",
				"diastolicbloodpressure"
			) ||
				keyContains(m, "diastolic"))
		) {
			out.diastolic = m.value
			continue
		}
		if (out.sdnn === null && (has(m, "sdnn") || keyContains(m, "sdnn"))) {
			out.sdnn = m.value
			continue
		}
		if (out.rmssd === null && (has(m, "rmssd") || keyContains(m, "rmssd"))) {
			out.rmssd = m.value
			continue
		}
		if (
			out.chf === null &&
			(has(m, "cvd_risk_chf", "cvdriskchf", "chf", "riskofcongestiveheartfailure") ||
				(keyContains(m, "chf") && pathHas(m, "risk")) ||
				keyContains(m, "congestive"))
		) {
			out.chf = m.value
			continue
		}
		if (
			out.chd === null &&
			(has(
				m,
				"cvd_risk_chd",
				"cvdriskchd",
				"chd",
				"riskofcoronaryheartdisease",
				"coronary_risk",
				"coronaryrisk"
			) ||
				(keyContains(m, "chd") && pathHas(m, "risk")) ||
				keyContains(m, "coronary"))
		) {
			out.chd = m.value
			continue
		}
		if (
			out.stroke === null &&
			(has(m, "cvd_risk_stroke", "cvdriskstroke", "stroke_risk", "strokerisk") ||
				keyContains(m, "stroke"))
		) {
			out.stroke = m.value
			continue
		}
		if (
			out.cvdGeneral === null &&
			has(m, "cvd_risk_general", "cvdriskgeneral", "general_cvd_risk", "generalcvdrisk")
		) {
			out.cvdGeneral = m.value
			continue
		}
		if (
			out.stress === null &&
			(has(m, "stress_index", "stressindex", "stress_level", "stresslevel", "stress") ||
				(keyContains(m, "stress") && !keyContains(m, "destressing")))
		) {
			out.stress = m.value
			continue
		}
		if (
			out.wellness === null &&
			has(m, "general_wellness", "generalwellness", "wellness_index", "wellnessindex")
		) {
			out.wellness = m.value
			continue
		}
		if (
			out.cardiacWorkload === null &&
			has(m, "cardiac_workload", "cardiacworkload")
		) {
			out.cardiacWorkload = m.value
			continue
		}
		if (out.heartAge === null && has(m, "heart_age", "heartage")) {
			out.heartAge = m.value
			continue
		}
		if (out.hemoglobin === null && has(m, "hemoglobin", "haemoglobin", "hgb")) {
			out.hemoglobin = m.value
			continue
		}
		if (
			out.hemoglobinA1c === null &&
			has(m, "hemoglobin_a1c", "hemoglobina1c", "hba1c", "a1c")
		) {
			out.hemoglobinA1c = m.value
			continue
		}
		if (out.meanRri === null && has(m, "mean_rri", "meanrri", "rri_mean")) {
			out.meanRri = m.value
			continue
		}
		if (out.lfhf === null && has(m, "lf_hf_ratio", "lfhfratio", "lfhf", "lf_hf")) {
			out.lfhf = m.value
			continue
		}
		if (out.ascvd === null && has(m, "ascvd_risk", "ascvdrisk", "ascvd")) {
			out.ascvd = m.value
			continue
		}
		if (
			out.hypertensionRisk === null &&
			has(m, "hypertension_risk", "hypertensionrisk", "high_blood_pressure_risk", "cvd_risk_hypertension")
		) {
			out.hypertensionRisk = m.value
			continue
		}
		if (
			out.diabetesRisk === null &&
			has(m, "diabetes_risk", "diabetesrisk", "high_fasting_glucose_risk")
		) {
			out.diabetesRisk = m.value
			continue
		}
	}

	return out
}

export function mapInsightGenieToVitalSigns(message: any): VitalSigns {
	const result = emptyVitalSigns()
	if (!message) return result

	const m = extractDeepMetrics(message)

	if (m.heartRate !== null) result.pulseRate = vs(m.heartRate)
	if (m.respiratoryRate !== null) result.respirationRate = vs(m.respiratoryRate)
	if (m.spo2 !== null) result.oxygenSaturation = vs(m.spo2)

	if (m.systolic !== null && m.diastolic !== null) {
		result.bloodPressure = vs<BloodPressureValue>({
			systolic: m.systolic,
			diastolic: m.diastolic,
		})
		const map = (m.systolic + 2 * m.diastolic) / 3
		result.meanArterialPressure = vs(parseFloat(map.toFixed(1)))
		result.pulsePressure = vs(m.systolic - m.diastolic)
	}

	if (m.stress !== null) {
		result.stressIndex = vs(m.stress)
		result.stressLevel = vs(m.stress)
	}
	if (m.wellness !== null) result.wellnessIndex = vs(m.wellness)
	if (m.cardiacWorkload !== null) result.cardiacWorkload = vs(m.cardiacWorkload)
	if (m.sdnn !== null) result.sdnn = vs(m.sdnn)
	if (m.rmssd !== null) result.rmssd = vs(m.rmssd)
	if (m.meanRri !== null) result.meanRri = vs(m.meanRri)
	if (m.lfhf !== null) result.lfhf = vs(m.lfhf)
	if (m.ascvd !== null) result.ascvdRisk = vs(m.ascvd)
	if (m.heartAge !== null) result.heartAge = vs(m.heartAge)
	if (m.hemoglobin !== null) result.hemoglobin = vs(m.hemoglobin)
	if (m.hemoglobinA1c !== null) result.hemoglobinA1c = vs(m.hemoglobinA1c)

	const bpRiskPercent =
		m.hypertensionRisk !== null
			? m.hypertensionRisk * 100
			: m.cvdGeneral !== null
				? m.cvdGeneral * 100
				: null
	const bpRiskLabel = riskLevelFromPercent(bpRiskPercent)
	if (bpRiskLabel !== null) result.highBloodPressureRisk = vs(bpRiskLabel)

	const glucoseLabel = riskLevelFromPercent(
		m.diabetesRisk !== null ? m.diabetesRisk * 100 : null
	)
	if (glucoseLabel !== null) result.highFastingGlucoseRisk = vs(glucoseLabel)

	if (
		(m.chf !== null || m.chd !== null || m.stroke !== null) &&
		result.highBloodPressureRisk.value === null
	) {
		const worst = Math.max(m.chf ?? 0, m.chd ?? 0, m.stroke ?? 0) * 100
		const worstLabel = riskLevelFromPercent(worst)
		if (worstLabel !== null) result.highBloodPressureRisk = vs(worstLabel)
	}

	return result
}

function statusFromRiskPercent(percent: number): { status: ResultStatus; color: ResultColor } {
	if (percent < 2) return { status: "Good", color: "green" }
	if (percent < 5) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromHeartRate(bpm: number): { status: ResultStatus; color: ResultColor } {
	if (bpm >= 60 && bpm <= 100) return { status: "Good", color: "green" }
	if ((bpm >= 50 && bpm < 60) || (bpm > 100 && bpm <= 110))
		return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromSpo2(spo2: number): { status: ResultStatus; color: ResultColor } {
	if (spo2 >= 95) return { status: "Good", color: "green" }
	if (spo2 >= 90) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromSystolic(s: number): { status: ResultStatus; color: ResultColor } {
	if (s >= 90 && s <= 120) return { status: "Good", color: "green" }
	if (s > 120 && s <= 140) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromDiastolic(d: number): { status: ResultStatus; color: ResultColor } {
	if (d >= 60 && d <= 80) return { status: "Good", color: "green" }
	if (d > 80 && d <= 90) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromSdnn(ms: number): { status: ResultStatus; color: ResultColor } {
	if (ms >= 50) return { status: "Good", color: "green" }
	if (ms >= 30) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromRmssd(ms: number): { status: ResultStatus; color: ResultColor } {
	if (ms >= 30) return { status: "Good", color: "green" }
	if (ms >= 15) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

function statusFromStress(value: number): { status: ResultStatus; color: ResultColor } {
	// Insight-Genie raw stress is typically 0-3 (low) up to higher values
	if (value < 1.5) return { status: "Good", color: "green" }
	if (value < 3) return { status: "Average", color: "orange" }
	return { status: "Poor", color: "red" }
}

export function extractInsightGenieResults(message: any): HealthResult[] {
	const results: HealthResult[] = []
	if (!message) return results

	const m = extractDeepMetrics(message)

	if (m.chd !== null) {
		const pct = m.chd * 100
		const { status, color } = statusFromRiskPercent(pct)
		results.push({
			title: "Coronary Heart Disease Risk",
			value: `${pct.toFixed(1)} %`,
			score: pct,
			status,
			color,
			category: "cardiovascular",
			normalRange: "< 2%",
		})
	}

	if (m.chf !== null) {
		const pct = m.chf * 100
		const { status, color } = statusFromRiskPercent(pct)
		results.push({
			title: "Congestive Heart Failure Risk",
			value: `${pct.toFixed(1)} %`,
			score: pct,
			status,
			color,
			category: "cardiovascular",
			normalRange: "< 2%",
		})
	}

	if (m.stroke !== null) {
		const pct = m.stroke * 100
		const { status, color } = statusFromRiskPercent(pct)
		results.push({
			title: "Stroke Risk",
			value: `${pct.toFixed(1)} %`,
			score: pct,
			status,
			color,
			category: "cardiovascular",
			normalRange: "< 2%",
		})
	}

	if (m.heartRate !== null) {
		const { status, color } = statusFromHeartRate(m.heartRate)
		results.push({
			title: "Heart Rate",
			value: `${m.heartRate.toFixed(1)} bpm`,
			score: m.heartRate,
			status,
			color,
			category: "heart",
			normalRange: "60-100 bpm",
		})
	}

	if (m.sdnn !== null) {
		const { status, color } = statusFromSdnn(m.sdnn)
		results.push({
			title: "SDNN",
			value: `${m.sdnn.toFixed(1)} ms`,
			score: m.sdnn,
			status,
			color,
			category: "hrv",
		})
	}

	if (m.rmssd !== null) {
		const { status, color } = statusFromRmssd(m.rmssd)
		results.push({
			title: "RMSSD",
			value: `${m.rmssd.toFixed(1)} ms`,
			score: m.rmssd,
			status,
			color,
			category: "hrv",
		})
	}

	if (m.spo2 !== null) {
		const { status, color } = statusFromSpo2(m.spo2)
		results.push({
			title: "Oxygen Saturation",
			value: `${m.spo2.toFixed(1)} %`,
			score: m.spo2,
			status,
			color,
			category: "blood",
			normalRange: "95-100%",
		})
	}

	if (m.systolic !== null) {
		const { status, color } = statusFromSystolic(m.systolic)
		results.push({
			title: "Systolic",
			value: `${m.systolic.toFixed(1)} mmHg`,
			score: m.systolic,
			status,
			color,
			category: "blood",
			normalRange: "90-120 mmHg",
		})
	}

	if (m.diastolic !== null) {
		const { status, color } = statusFromDiastolic(m.diastolic)
		results.push({
			title: "Diastolic",
			value: `${m.diastolic.toFixed(1)} mmHg`,
			score: m.diastolic,
			status,
			color,
			category: "blood",
			normalRange: "60-80 mmHg",
		})
	}

	if (m.stress !== null) {
		const { status, color } = statusFromStress(m.stress)
		results.push({
			title: "Stress Level (Raw)",
			value: m.stress.toFixed(2),
			score: m.stress,
			status,
			color,
			category: "other",
		})
	}

	return results
}
