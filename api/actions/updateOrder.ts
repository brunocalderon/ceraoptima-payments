const database = require('/gadget/app/api/helpers/database');

/* dayjs */
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require("dayjs/plugin/isoWeek");
const dayjsTimeZone = "America/Santiago";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
/* dayjs */

const weekDayInfo = (dayOfWeek) => {
    const weekDays = [{
        day: 1,
        nextDay: 2,
        nextBusinessDay: 2,
        isBusinessDay: true,
        dayNameString: 'Lunes',
    },
    {
        day: 2,
        nextDay: 3,
        nextBusinessDay: 3,
        isBusinessDay: true,
        dayNameString: 'Martes',
    },
    {
        day: 3,
        nextDay: 4,
        nextBusinessDay: 4,
        isBusinessDay: true,
        dayNameString: 'Miércoles',
    },
    {
        day: 4,
        nextDay: 5,
        nextBusinessDay: 5,
        isBusinessDay: true,
        dayNameString: 'Jueves',
    },
    {
        day: 5,
        nextDay: 6,
        nextBusinessDay: 1,
        isBusinessDay: true,
        dayNameString: 'Viernes',
    },
    {
        day: 6,
        nextDay: 7,
        nextBusinessDay: 1,
        isBusinessDay: false,
        dayNameString: 'Sábado',
    },
    {
        day: 7,
        nextDay: 1,
        nextBusinessDay: 1,
        isBusinessDay: false,
        dayNameString: 'Domingo',
    },
    ]
    return weekDays.find((day) => day.day === dayOfWeek);
}

const getNextDay = (currentDay) => {
    const currentDayInfo = weekDayInfo(currentDay);
    const nextDayInfo = weekDayInfo(currentDayInfo.nextDay);
    const nextBusinessDayInfo = weekDayInfo(currentDayInfo.nextBusinessDay);
    return {
        nextRegularDay: nextDayInfo,
        nextBusinessDay: nextBusinessDayInfo,
    }
}

const nextFulfillmentPromise = () => {
    const availabilities = [
        {
            "day": 1,
            "window_end": {
                "hour": 12,
                "minute": 5
            }
        },
        {
            "day": 2,
            "window_end": {
                "hour": 12,
                "minute": 5
            }
        },
        {
            "day": 3,
            "window_end": {
                "hour": 12,
                "minute": 5
            }
        },
        {
            "day": 4,
            "window_end": {
                "hour": 12,
                "minute": 5
            }
        },
        {
            "day": 5,
            "window_end": {
                "hour": 12,
                "minute": 5
            }
        },
    ];
    const now = dayjs.tz(dayjs(), dayjsTimeZone);
    const currentDayOfWeekAtSCL = dayjs(now).isoWeekday();
    const nextDay = getNextDay(currentDayOfWeekAtSCL);
    const availabilityForToday = availabilities.find((availability) => availability.day === currentDayOfWeekAtSCL);

    if (availabilityForToday && availabilityForToday !== null) {
        const cutOffTimestamp = dayjs(now).hour(availabilityForToday.window_end.hour).minute(availabilityForToday.window_end.minute).second(0);
        const isWithinCutoffWindow = dayjs(now).isBefore(dayjs(cutOffTimestamp));
        const availabilityForTomorrow = availabilities.find((availability) => availability.day === nextDay.nextRegularDay.day);
        if (isWithinCutoffWindow) {
            return dayjs.tz(dayjs(), dayjsTimeZone).format('YYYY-MM-DD');
        }
        if (availabilityForTomorrow && availabilityForTomorrow !== null) {
            return dayjs.tz(dayjs().add(1, 'day'), dayjsTimeZone).format('YYYY-MM-DD');
        }
        return dayjs.tz(dayjs().add(1, 'week'), dayjsTimeZone).isoWeekday(1).format('YYYY-MM-DD');
    } else {
        return dayjs.tz(dayjs().add(1, 'week'), dayjsTimeZone).isoWeekday(1).format('YYYY-MM-DD');
    }
}

export async function run({ params }) {
    const fulfillmentDate = nextFulfillmentPromise();
    // named placeholders for the prepared query
    const updateOrderQueryParams = {
        idpedido: params.orderId,
        fulfill_at: fulfillmentDate,
    };
    // the raw SQL query
    const updateOrderQuery = `
    UPDATE
        pedidos
    SET
        payment_status = 'paid',
        payment_method = 15,
        paid_at = NOW(),
        fulfill_at = :fulfill_at
    WHERE
        idpedido = :idpedido`;
    // execute the query
    const connection = await database.createConnection();
    const orderData = await database.executePreparedQuery(connection, updateOrderQuery, updateOrderQueryParams);
    await database.releaseConnection(connection);
    return orderData;
}

export const params = {
    orderId: {
        type: "number",
        required: true,
    },
};