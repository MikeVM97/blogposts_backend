import { Months } from "../../types";

export default function strToDate(str: string) {
  const array = str.split(' ');
  const day: number = parseInt(array[0], 10);
  const month = array[1].slice(0, array[1].length - 1);
  const year: number = parseInt(array[2], 10);
  const months: Months = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11,
  };
  const date = new Date(year, months[month as keyof Months], day);
  return date;
}