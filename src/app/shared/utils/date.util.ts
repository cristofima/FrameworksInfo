export class DateUtil {

    static parseDate(numberDate: string) {
        let year = Number(numberDate.substring(0, 4));
        let month = Number(numberDate.substring(4, 6)) - 1;
        let day = Number(numberDate.substring(6, 8));
        let hour = Number(numberDate.substring(8, 10));
        let minutes = Number(numberDate.substring(10, 12));
        let seconds = Number(numberDate.substring(12));

        return new Date(year, month, day, hour, minutes, seconds);
    }
}