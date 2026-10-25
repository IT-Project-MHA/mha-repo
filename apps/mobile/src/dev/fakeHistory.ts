// DEV ONLY sample data for previewing charts without a server.
// -Turn on with EXPO_PUBLIC_FAKE_DATA=true in apps/mobile/.env, then restart with `npx expo start -c`
// -Change num weeks with EXPO_PUBLIC_FAKE_WEEKS={however many} in apps/mobile/.env
// -env values are baked in at bundle time 
// -Never active in production builds.
export const USE_FAKE_DATA = __DEV__ && process.env.EXPO_PUBLIC_FAKE_DATA === "true";
import { toApiDate } from "../../constants/date";

// how many weeks to generate, defaults to 50
const FAKE_WEEKS = Number(process.env.EXPO_PUBLIC_FAKE_WEEKS ?? 50);
const FAKE_LOCATIONS = ["Knees", "Lower back", "Shoulders", "Hips", "Hands"];

// same shape the API helpers return, with oldest first
export function fakeHistory(areaKey: string) {
    // seeded so the same area always gives the same line
    let seed = [...areaKey].reduce((s, c) => s + c.charCodeAt(0), 7);
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };

    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    let value = 3 + rand() * 4;
    const points: any[] = [];
    for (let i = FAKE_WEEKS - 1; i >= 0; i--) {
        const d = new Date(monday);
        d.setDate(monday.getDate() - i * 7);
        value = Math.min(10, Math.max(0, value + (rand() - 0.5) * 3));
        const score = Math.round(value * 10) / 10;
        const point: any = {
            completedAt: toApiDate(d),
            score,
        };
        if (areaKey === "pain") {
            point.worst = Math.min(10, Math.round(score + 1 + rand() * 2));
            point.mildest = Math.max(0, Math.round(score - 1 - rand() * 2));
            point.locations = FAKE_LOCATIONS.filter((_, idx) =>
                idx === 0 ? rand() < 0.6 : rand() < 0.25,
            );
        }
        points.push(point);
    }
    // small delay so the loading spinner is visible too
    return new Promise<any[]>((resolve) => setTimeout(() => resolve(points), 400));
}