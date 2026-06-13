// Master player list — name, nationality, flag emoji, date of birth
// These are searchable from autocomplete regardless of the active objective.
// If a player isn't in the objective's score map, they return "not found".

export const players = [
  // Argentina
  { name: 'Lionel Messi',         nationality: 'Argentina',      flag: '🇦🇷', dob: '24 Jun 1987' },
  { name: 'Diego Maradona',       nationality: 'Argentina',      flag: '🇦🇷', dob: '30 Oct 1960' },
  { name: 'Sergio Aguero',        nationality: 'Argentina',      flag: '🇦🇷', dob: '2 Jun 1988' },
  { name: 'Gabriel Batistuta',    nationality: 'Argentina',      flag: '🇦🇷', dob: '1 Feb 1969' },
  { name: 'Hernan Crespo',        nationality: 'Argentina',      flag: '🇦🇷', dob: '5 Jul 1975' },
  { name: 'Angel Di Maria',       nationality: 'Argentina',      flag: '🇦🇷', dob: '14 Feb 1988' },
  { name: 'Javier Mascherano',    nationality: 'Argentina',      flag: '🇦🇷', dob: '8 Jun 1984' },
  { name: 'Alfredo Di Stefano',   nationality: 'Argentina',      flag: '🇦🇷', dob: '4 Jul 1926' },
  { name: 'Paulo Dybala',         nationality: 'Argentina',      flag: '🇦🇷', dob: '15 Nov 1993' },
  { name: 'Gonzalo Higuain',      nationality: 'Argentina',      flag: '🇦🇷', dob: '10 Dec 1987' },

  // Australia
  { name: 'Harry Kewell',         nationality: 'Australia',      flag: '🇦🇺', dob: '22 Sep 1978' },
  { name: 'Tim Cahill',           nationality: 'Australia',      flag: '🇦🇺', dob: '6 Dec 1979' },
  { name: 'Mark Viduka',          nationality: 'Australia',      flag: '🇦🇺', dob: '9 Oct 1975' },

  // Belgium
  { name: 'Kevin De Bruyne',      nationality: 'Belgium',        flag: '🇧🇪', dob: '28 Jun 1991' },
  { name: 'Romelu Lukaku',        nationality: 'Belgium',        flag: '🇧🇪', dob: '13 May 1993' },
  { name: 'Eden Hazard',          nationality: 'Belgium',        flag: '🇧🇪', dob: '7 Jan 1991' },
  { name: 'Thibaut Courtois',     nationality: 'Belgium',        flag: '🇧🇪', dob: '11 May 1992' },
  { name: 'Jan Vertonghen',       nationality: 'Belgium',        flag: '🇧🇪', dob: '24 Apr 1987' },
  { name: 'Dries Mertens',        nationality: 'Belgium',        flag: '🇧🇪', dob: '6 May 1987' },
  { name: 'Vincent Kompany',      nationality: 'Belgium',        flag: '🇧🇪', dob: '10 Apr 1986' },
  { name: 'Marc Wilmots',         nationality: 'Belgium',        flag: '🇧🇪', dob: '22 Feb 1969' },

  // Bosnia
  { name: 'Edin Dzeko',           nationality: 'Bosnia',         flag: '🇧🇦', dob: '17 Mar 1986' },
  { name: 'Miralem Pjanic',       nationality: 'Bosnia',         flag: '🇧🇦', dob: '2 Apr 1990' },

  // Brazil
  { name: 'Ronaldo Nazario',      nationality: 'Brazil',         flag: '🇧🇷', dob: '22 Sep 1976' },
  { name: 'Ronaldinho',           nationality: 'Brazil',         flag: '🇧🇷', dob: '21 Mar 1980' },
  { name: 'Pele',                 nationality: 'Brazil',         flag: '🇧🇷', dob: '23 Oct 1940' },
  { name: 'Neymar',               nationality: 'Brazil',         flag: '🇧🇷', dob: '5 Feb 1992' },
  { name: 'Vinicius Jr',          nationality: 'Brazil',         flag: '🇧🇷', dob: '12 Jul 2000' },
  { name: 'Roberto Carlos',       nationality: 'Brazil',         flag: '🇧🇷', dob: '10 Apr 1973' },
  { name: 'Cafu',                 nationality: 'Brazil',         flag: '🇧🇷', dob: '7 Jun 1970' },
  { name: 'Rivaldo',              nationality: 'Brazil',         flag: '🇧🇷', dob: '19 Apr 1972' },
  { name: 'Kaka',                 nationality: 'Brazil',         flag: '🇧🇷', dob: '22 Apr 1982' },
  { name: 'Thiago Silva',         nationality: 'Brazil',         flag: '🇧🇷', dob: '22 Sep 1984' },
  { name: 'Marcelo',              nationality: 'Brazil',         flag: '🇧🇷', dob: '12 May 1988' },
  { name: 'Adriano',              nationality: 'Brazil',         flag: '🇧🇷', dob: '17 Feb 1982' },
  { name: 'Zico',                 nationality: 'Brazil',         flag: '🇧🇷', dob: '3 Mar 1953' },
  { name: 'Socrates',             nationality: 'Brazil',         flag: '🇧🇷', dob: '19 Feb 1954' },
  { name: 'Romario',              nationality: 'Brazil',         flag: '🇧🇷', dob: '29 Jan 1966' },
  { name: 'Bebeto',               nationality: 'Brazil',         flag: '🇧🇷', dob: '16 Feb 1964' },

  // Cameroon
  { name: "Samuel Eto'o",         nationality: 'Cameroon',       flag: '🇨🇲', dob: '10 Mar 1981' },
  { name: 'Roger Milla',          nationality: 'Cameroon',       flag: '🇨🇲', dob: '20 May 1952' },

  // Chile
  { name: 'Alexis Sanchez',       nationality: 'Chile',          flag: '🇨🇱', dob: '19 Dec 1988' },
  { name: 'Arturo Vidal',         nationality: 'Chile',          flag: '🇨🇱', dob: '22 May 1987' },
  { name: 'Ivan Zamorano',        nationality: 'Chile',          flag: '🇨🇱', dob: '18 Jan 1967' },
  { name: 'Marcelo Salas',        nationality: 'Chile',          flag: '🇨🇱', dob: '24 Dec 1974' },

  // Colombia
  { name: 'Radamel Falcao',       nationality: 'Colombia',       flag: '🇨🇴', dob: '10 Feb 1986' },
  { name: 'James Rodriguez',      nationality: 'Colombia',       flag: '🇨🇴', dob: '12 Jul 1991' },
  { name: 'Carlos Valderrama',    nationality: 'Colombia',       flag: '🇨🇴', dob: '2 Sep 1961' },
  { name: 'Fredy Guarin',         nationality: 'Colombia',       flag: '🇨🇴', dob: '30 Jun 1986' },

  // Croatia
  { name: 'Luka Modric',          nationality: 'Croatia',        flag: '🇭🇷', dob: '9 Sep 1985' },
  { name: 'Ivan Rakitic',         nationality: 'Croatia',        flag: '🇭🇷', dob: '10 Mar 1988' },
  { name: 'Davor Suker',          nationality: 'Croatia',        flag: '🇭🇷', dob: '1 Jan 1968' },
  { name: 'Zvonimir Boban',       nationality: 'Croatia',        flag: '🇭🇷', dob: '8 Oct 1968' },
  { name: 'Ivan Perisic',         nationality: 'Croatia',        flag: '🇭🇷', dob: '2 Feb 1989' },
  { name: 'Mario Mandzukic',      nationality: 'Croatia',        flag: '🇭🇷', dob: '21 May 1986' },

  // Czech Republic
  { name: 'Pavel Nedved',         nationality: 'Czech Republic', flag: '🇨🇿', dob: '30 Aug 1972' },
  { name: 'Petr Cech',            nationality: 'Czech Republic', flag: '🇨🇿', dob: '20 May 1982' },
  { name: 'Tomas Rosicky',        nationality: 'Czech Republic', flag: '🇨🇿', dob: '4 Oct 1980' },

  // Denmark
  { name: 'Peter Schmeichel',     nationality: 'Denmark',        flag: '🇩🇰', dob: '18 Nov 1963' },
  { name: 'Michael Laudrup',      nationality: 'Denmark',        flag: '🇩🇰', dob: '15 Jun 1964' },
  { name: 'Brian Laudrup',        nationality: 'Denmark',        flag: '🇩🇰', dob: '22 Feb 1969' },
  { name: 'Christian Eriksen',    nationality: 'Denmark',        flag: '🇩🇰', dob: '14 Feb 1992' },
  { name: 'Kasper Schmeichel',    nationality: 'Denmark',        flag: '🇩🇰', dob: '5 Nov 1986' },

  // Egypt
  { name: 'Mohamed Salah',        nationality: 'Egypt',          flag: '🇪🇬', dob: '15 Jun 1992' },

  // England
  { name: 'Wayne Rooney',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '24 Oct 1985' },
  { name: 'David Beckham',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '2 May 1975' },
  { name: 'Steven Gerrard',       nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '30 May 1980' },
  { name: 'Frank Lampard',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '20 Jun 1978' },
  { name: 'Alan Shearer',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '13 Aug 1970' },
  { name: 'Harry Kane',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '28 Jul 1993' },
  { name: 'Michael Owen',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '14 Dec 1979' },
  { name: 'Paul Scholes',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '16 Nov 1974' },
  { name: 'Bobby Moore',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '12 Apr 1941' },
  { name: 'Bobby Charlton',       nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '11 Oct 1937' },
  { name: 'Gary Lineker',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '30 Nov 1960' },
  { name: 'Peter Shilton',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '18 Sep 1949' },
  { name: 'Ashley Cole',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '20 Dec 1980' },
  { name: 'Rio Ferdinand',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '7 Nov 1978' },
  { name: 'Gary Neville',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '18 Feb 1975' },
  { name: 'Sol Campbell',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '18 Sep 1974' },
  { name: 'Bryan Robson',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '11 Jan 1957' },
  { name: 'Billy Wright',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '6 Feb 1924' },
  { name: 'Terry Butcher',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '28 Dec 1958' },
  { name: 'Stuart Pearce',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '24 Apr 1962' },
  { name: 'David Seaman',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '19 Sep 1963' },
  { name: 'Gordon Banks',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '30 Dec 1937' },
  { name: 'Tony Adams',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '10 Oct 1966' },
  { name: 'John Terry',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '7 Dec 1980' },
  { name: 'Martin Peters',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '8 Nov 1943' },
  { name: 'Peter Beardsley',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '18 Jan 1961' },
  { name: 'Jude Bellingham',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '29 Jun 2003' },
  { name: 'Bukayo Saka',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '5 Sep 2001' },
  { name: 'Declan Rice',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '14 Jan 1999' },
  { name: 'Phil Foden',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '28 May 2000' },
  { name: 'Marcus Rashford',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '31 Oct 1997' },
  { name: 'Jordan Henderson',     nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '17 Jun 1990' },
  { name: 'Jack Grealish',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '10 Sep 1995' },
  { name: 'Mason Mount',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '10 Jan 1999' },
  { name: 'Trent Alexander-Arnold', nationality: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '7 Oct 1998' },
  { name: 'Kyle Walker',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '28 May 1990' },
  { name: 'Kieran Trippier',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '19 Sep 1990' },
  { name: 'Joe Hart',             nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '19 Apr 1987' },
  { name: 'Robbie Fowler',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '9 Apr 1975' },
  { name: 'Jermain Defoe',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '7 Oct 1982' },
  { name: 'Andrew Cole',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '15 Oct 1971' },
  { name: 'Les Ferdinand',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '18 Dec 1966' },
  { name: 'Teddy Sheringham',     nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '2 Apr 1966' },
  { name: 'Ian Wright',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '3 Nov 1963' },
  { name: 'Matt Le Tissier',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '14 Oct 1968' },
  { name: 'Dion Dublin',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '22 Apr 1969' },
  { name: 'Emile Heskey',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '11 Jan 1978' },
  { name: 'Peter Crouch',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '30 Jan 1981' },
  { name: 'Jamie Vardy',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '11 Jan 1987' },
  { name: 'Darren Bent',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '6 Feb 1984' },
  { name: 'Daniel Sturridge',     nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '1 Sep 1989' },
  { name: 'Glenn Murray',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '25 Sep 1983' },
  { name: 'Robin van Persie',     nationality: 'Netherlands',    flag: '🇳🇱', dob: '6 Aug 1983' },

  // France
  { name: 'Zinedine Zidane',      nationality: 'France',         flag: '🇫🇷', dob: '23 Jun 1972' },
  { name: 'Thierry Henry',        nationality: 'France',         flag: '🇫🇷', dob: '17 Aug 1977' },
  { name: 'Kylian Mbappe',        nationality: 'France',         flag: '🇫🇷', dob: '20 Dec 1998' },
  { name: 'Karim Benzema',        nationality: 'France',         flag: '🇫🇷', dob: '19 Dec 1987' },
  { name: 'Antoine Griezmann',    nationality: 'France',         flag: '🇫🇷', dob: '21 Mar 1991' },
  { name: 'Patrick Vieira',       nationality: 'France',         flag: '🇫🇷', dob: '23 Jun 1976' },
  { name: 'Robert Pires',         nationality: 'France',         flag: '🇫🇷', dob: '29 Oct 1973' },
  { name: 'Frank Ribery',         nationality: 'France',         flag: '🇫🇷', dob: '7 Apr 1983' },
  { name: 'Olivier Giroud',       nationality: 'France',         flag: '🇫🇷', dob: '30 Sep 1986' },
  { name: 'Paul Pogba',           nationality: 'France',         flag: '🇫🇷', dob: '15 Mar 1993' },
  { name: "N'Golo Kante",         nationality: 'France',         flag: '🇫🇷', dob: '29 Mar 1991' },
  { name: 'Nicolas Anelka',       nationality: 'France',         flag: '🇫🇷', dob: '14 Mar 1979' },
  { name: 'Eric Cantona',         nationality: 'France',         flag: '🇫🇷', dob: '24 May 1966' },
  { name: 'Laurent Blanc',        nationality: 'France',         flag: '🇫🇷', dob: '19 Nov 1965' },
  { name: 'Lilian Thuram',        nationality: 'France',         flag: '🇫🇷', dob: '1 Jan 1972' },
  { name: 'Marcel Desailly',      nationality: 'France',         flag: '🇫🇷', dob: '7 Sep 1968' },
  { name: 'Didier Deschamps',     nationality: 'France',         flag: '🇫🇷', dob: '15 Oct 1968' },
  { name: 'Aurelien Tchouameni', nationality: 'France',          flag: '🇫🇷', dob: '16 Jan 2000' },

  // Germany
  { name: 'Miroslav Klose',       nationality: 'Germany',        flag: '🇩🇪', dob: '9 Jun 1978' },
  { name: 'Gerd Muller',          nationality: 'Germany',        flag: '🇩🇪', dob: '3 Nov 1945' },
  { name: 'Thomas Muller',        nationality: 'Germany',        flag: '🇩🇪', dob: '13 Sep 1989' },
  { name: 'Franz Beckenbauer',    nationality: 'Germany',        flag: '🇩🇪', dob: '11 Sep 1945' },
  { name: 'Oliver Kahn',          nationality: 'Germany',        flag: '🇩🇪', dob: '15 Jun 1969' },
  { name: 'Michael Ballack',      nationality: 'Germany',        flag: '🇩🇪', dob: '26 Sep 1976' },
  { name: 'Bastian Schweinsteiger', nationality: 'Germany',      flag: '🇩🇪', dob: '1 Aug 1984' },
  { name: 'Jurgen Klinsmann',     nationality: 'Germany',        flag: '🇩🇪', dob: '30 Jul 1964' },
  { name: 'Karl-Heinz Rummenigge', nationality: 'Germany',       flag: '🇩🇪', dob: '25 Sep 1955' },
  { name: 'Lothar Matthaus',      nationality: 'Germany',        flag: '🇩🇪', dob: '21 Mar 1961' },
  { name: 'Manuel Neuer',         nationality: 'Germany',        flag: '🇩🇪', dob: '27 Mar 1986' },
  { name: 'Mario Gomez',          nationality: 'Germany',        flag: '🇩🇪', dob: '10 Jul 1985' },
  { name: 'Uwe Seeler',           nationality: 'Germany',        flag: '🇩🇪', dob: '5 Nov 1936' },

  // Ghana
  { name: 'Michael Essien',       nationality: 'Ghana',          flag: '🇬🇭', dob: '3 Dec 1982' },
  { name: 'Asamoah Gyan',         nationality: 'Ghana',          flag: '🇬🇭', dob: '22 Nov 1985' },
  { name: 'Abedi Pele',           nationality: 'Ghana',          flag: '🇬🇭', dob: '5 Nov 1964' },

  // Greece
  { name: 'Theodoros Zagorakis',  nationality: 'Greece',         flag: '🇬🇷', dob: '27 Oct 1971' },
  { name: 'Angelos Charisteas',   nationality: 'Greece',         flag: '🇬🇷', dob: '9 Feb 1980' },

  // Hungary
  { name: 'Ferenc Puskas',        nationality: 'Hungary',        flag: '🇭🇺', dob: '2 Apr 1927' },
  { name: 'Sandor Kocsis',        nationality: 'Hungary',        flag: '🇭🇺', dob: '23 Sep 1929' },

  // Iran
  { name: 'Ali Daei',             nationality: 'Iran',           flag: '🇮🇷', dob: '21 Mar 1969' },
  { name: 'Mehdi Taremi',         nationality: 'Iran',           flag: '🇮🇷', dob: '18 Jul 1992' },

  // Ireland
  { name: 'Robbie Keane',         nationality: 'Ireland',        flag: '🇮🇪', dob: '8 Jul 1980' },
  { name: 'Roy Keane',            nationality: 'Ireland',        flag: '🇮🇪', dob: '10 Aug 1971' },
  { name: 'Damien Duff',          nationality: 'Ireland',        flag: '🇮🇪', dob: '2 Mar 1979' },
  { name: 'Niall Quinn',          nationality: 'Ireland',        flag: '🇮🇪', dob: '6 Oct 1966' },
  { name: 'Paul McGrath',         nationality: 'Ireland',        flag: '🇮🇪', dob: '4 Dec 1959' },

  // Italy
  { name: 'Paolo Maldini',        nationality: 'Italy',          flag: '🇮🇹', dob: '26 Jun 1968' },
  { name: 'Roberto Baggio',       nationality: 'Italy',          flag: '🇮🇹', dob: '18 Feb 1967' },
  { name: 'Gianluigi Buffon',     nationality: 'Italy',          flag: '🇮🇹', dob: '28 Jan 1978' },
  { name: 'Alessandro Del Piero', nationality: 'Italy',          flag: '🇮🇹', dob: '9 Nov 1974' },
  { name: 'Francesco Totti',      nationality: 'Italy',          flag: '🇮🇹', dob: '27 Sep 1976' },
  { name: 'Filippo Inzaghi',      nationality: 'Italy',          flag: '🇮🇹', dob: '9 Aug 1973' },
  { name: 'Andrea Pirlo',         nationality: 'Italy',          flag: '🇮🇹', dob: '19 May 1979' },
  { name: 'Luca Toni',            nationality: 'Italy',          flag: '🇮🇹', dob: '26 May 1977' },
  { name: 'Giorgio Chiellini',    nationality: 'Italy',          flag: '🇮🇹', dob: '14 Aug 1984' },
  { name: 'Gianluca Vialli',      nationality: 'Italy',          flag: '🇮🇹', dob: '9 Jul 1964' },
  { name: 'Christian Vieri',      nationality: 'Italy',          flag: '🇮🇹', dob: '12 Jul 1973' },
  { name: 'Simone Inzaghi',       nationality: 'Italy',          flag: '🇮🇹', dob: '5 Apr 1976' },
  { name: 'Gianluigi Donnarumma', nationality: 'Italy',          flag: '🇮🇹', dob: '25 Feb 1999' },

  // Ivory Coast
  { name: 'Didier Drogba',        nationality: 'Ivory Coast',    flag: '🇨🇮', dob: '11 Mar 1978' },
  { name: 'Yaya Toure',           nationality: 'Ivory Coast',    flag: '🇨🇮', dob: '13 May 1983' },
  { name: 'Kolo Toure',           nationality: 'Ivory Coast',    flag: '🇨🇮', dob: '19 Mar 1981' },

  // Japan
  { name: 'Hidetoshi Nakata',     nationality: 'Japan',          flag: '🇯🇵', dob: '22 Jan 1977' },
  { name: 'Shunsuke Nakamura',    nationality: 'Japan',          flag: '🇯🇵', dob: '24 Jun 1978' },
  { name: 'Shinji Kagawa',        nationality: 'Japan',          flag: '🇯🇵', dob: '17 Mar 1989' },

  // Mexico
  { name: 'Hugo Sanchez',         nationality: 'Mexico',         flag: '🇲🇽', dob: '11 Jul 1958' },
  { name: 'Jared Borgetti',       nationality: 'Mexico',         flag: '🇲🇽', dob: '14 Aug 1973' },

  // Morocco
  { name: 'Hakim Ziyech',         nationality: 'Morocco',        flag: '🇲🇦', dob: '19 Mar 1993' },
  { name: 'Achraf Hakimi',        nationality: 'Morocco',        flag: '🇲🇦', dob: '4 Nov 1998' },
  { name: 'Youssef En-Nesyri',    nationality: 'Morocco',        flag: '🇲🇦', dob: '1 Jan 1997' },

  // Netherlands
  { name: 'Johan Cruyff',         nationality: 'Netherlands',    flag: '🇳🇱', dob: '25 Apr 1947' },
  { name: 'Marco van Basten',     nationality: 'Netherlands',    flag: '🇳🇱', dob: '31 Oct 1964' },
  { name: 'Patrick Kluivert',     nationality: 'Netherlands',    flag: '🇳🇱', dob: '1 Jul 1976' },
  { name: 'Frank Rijkaard',       nationality: 'Netherlands',    flag: '🇳🇱', dob: '30 Sep 1962' },
  { name: 'Ruud Gullit',          nationality: 'Netherlands',    flag: '🇳🇱', dob: '1 Sep 1962' },
  { name: 'Ruud van Nistelrooy',  nationality: 'Netherlands',    flag: '🇳🇱', dob: '1 Jul 1976' },
  { name: 'Clarence Seedorf',     nationality: 'Netherlands',    flag: '🇳🇱', dob: '1 Apr 1976' },
  { name: 'Wesley Sneijder',      nationality: 'Netherlands',    flag: '🇳🇱', dob: '9 Jun 1984' },
  { name: 'Virgil van Dijk',      nationality: 'Netherlands',    flag: '🇳🇱', dob: '8 Jul 1991' },
  { name: 'Arjen Robben',         nationality: 'Netherlands',    flag: '🇳🇱', dob: '23 Jan 1984' },
  { name: 'Dennis Bergkamp',      nationality: 'Netherlands',    flag: '🇳🇱', dob: '10 May 1969' },
  { name: 'Jimmy Floyd Hasselbaink', nationality: 'Netherlands', flag: '🇳🇱', dob: '27 Mar 1972' },
  { name: 'Jaap Stam',            nationality: 'Netherlands',    flag: '🇳🇱', dob: '17 Jul 1972' },

  // Nigeria
  { name: 'Jay-Jay Okocha',       nationality: 'Nigeria',        flag: '🇳🇬', dob: '14 Aug 1973' },
  { name: 'Nwankwo Kanu',         nationality: 'Nigeria',        flag: '🇳🇬', dob: '1 Aug 1976' },
  { name: 'Rashidi Yekini',       nationality: 'Nigeria',        flag: '🇳🇬', dob: '23 Oct 1963' },
  { name: 'Victor Osimhen',       nationality: 'Nigeria',        flag: '🇳🇬', dob: '29 Dec 1998' },

  // Northern Ireland
  { name: 'George Best',          nationality: 'N. Ireland',     flag: '🇬🇧', dob: '22 May 1946' },
  { name: 'Pat Jennings',         nationality: 'N. Ireland',     flag: '🇬🇧', dob: '12 Jun 1945' },

  // Norway
  { name: 'Erling Haaland',       nationality: 'Norway',         flag: '🇳🇴', dob: '21 Jul 2000' },
  { name: 'Ole Gunnar Solskjaer', nationality: 'Norway',         flag: '🇳🇴', dob: '26 Feb 1973' },
  { name: 'Tore Andre Flo',       nationality: 'Norway',         flag: '🇳🇴', dob: '15 Jun 1973' },

  // Poland
  { name: 'Robert Lewandowski',   nationality: 'Poland',         flag: '🇵🇱', dob: '21 Aug 1988' },
  { name: 'Zbigniew Boniek',      nationality: 'Poland',         flag: '🇵🇱', dob: '3 Mar 1956' },

  // Portugal
  { name: 'Cristiano Ronaldo',    nationality: 'Portugal',       flag: '🇵🇹', dob: '5 Feb 1985' },
  { name: 'Luis Figo',            nationality: 'Portugal',       flag: '🇵🇹', dob: '4 Nov 1972' },
  { name: 'Eusebio',              nationality: 'Portugal',       flag: '🇵🇹', dob: '25 Jan 1942' },
  { name: 'Rui Costa',            nationality: 'Portugal',       flag: '🇵🇹', dob: '29 Mar 1972' },
  { name: 'Bruno Fernandes',      nationality: 'Portugal',       flag: '🇵🇹', dob: '8 Sep 1994' },
  { name: 'Joao Felix',           nationality: 'Portugal',       flag: '🇵🇹', dob: '10 Nov 1999' },
  { name: 'Rafael Leao',          nationality: 'Portugal',       flag: '🇵🇹', dob: '10 Jun 1999' },
  { name: 'Bernardo Silva',       nationality: 'Portugal',       flag: '🇵🇹', dob: '10 Aug 1994' },
  { name: 'Fernando Morientes',   nationality: 'Spain',          flag: '🇪🇸', dob: '5 Apr 1976' },

  // Romania
  { name: 'Gheorghe Hagi',        nationality: 'Romania',        flag: '🇷🇴', dob: '5 Feb 1965' },
  { name: 'Adrian Mutu',          nationality: 'Romania',        flag: '🇷🇴', dob: '8 Jan 1979' },

  // Russia / Soviet Union
  { name: 'Lev Yashin',           nationality: 'Russia',         flag: '🇷🇺', dob: '22 Oct 1929' },
  { name: 'Andrei Arshavin',      nationality: 'Russia',         flag: '🇷🇺', dob: '29 May 1981' },

  // Scotland
  { name: 'Kenny Dalglish',       nationality: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', dob: '4 Mar 1951' },
  { name: 'Denis Law',            nationality: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', dob: '24 Feb 1940' },
  { name: 'Graeme Souness',       nationality: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', dob: '6 May 1953' },
  { name: 'Ally McCoist',         nationality: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', dob: '24 Sep 1962' },

  // Senegal
  { name: 'Sadio Mane',           nationality: 'Senegal',        flag: '🇸🇳', dob: '10 Apr 1992' },
  { name: 'El Hadji Diouf',       nationality: 'Senegal',        flag: '🇸🇳', dob: '15 Jan 1981' },
  { name: 'Kalidou Koulibaly',    nationality: 'Senegal',        flag: '🇸🇳', dob: '20 Jun 1991' },

  // Serbia
  { name: 'Nemanja Vidic',        nationality: 'Serbia',         flag: '🇷🇸', dob: '21 Oct 1981' },
  { name: 'Aleksandar Mitrovic',  nationality: 'Serbia',         flag: '🇷🇸', dob: '16 Sep 1994' },
  { name: 'Dejan Savicevic',      nationality: 'Serbia',         flag: '🇷🇸', dob: '15 Sep 1966' },
  { name: 'Predrag Mijatovic',    nationality: 'Serbia',         flag: '🇷🇸', dob: '19 Jan 1969' },

  // Slovakia
  { name: 'Marek Hamsik',         nationality: 'Slovakia',       flag: '🇸🇰', dob: '27 Jul 1987' },
  { name: 'Martin Skrtel',        nationality: 'Slovakia',       flag: '🇸🇰', dob: '15 Dec 1984' },

  // South Korea
  { name: 'Park Ji-sung',         nationality: 'South Korea',    flag: '🇰🇷', dob: '25 Feb 1981' },
  { name: 'Son Heung-min',        nationality: 'South Korea',    flag: '🇰🇷', dob: '8 Jul 1992' },
  { name: 'Ahn Jung-hwan',        nationality: 'South Korea',    flag: '🇰🇷', dob: '27 Jan 1976' },

  // Spain
  { name: 'Xavi',                 nationality: 'Spain',          flag: '🇪🇸', dob: '25 Jan 1980' },
  { name: 'Andres Iniesta',       nationality: 'Spain',          flag: '🇪🇸', dob: '11 May 1984' },
  { name: 'Raul',                 nationality: 'Spain',          flag: '🇪🇸', dob: '27 Jun 1977' },
  { name: 'David Villa',          nationality: 'Spain',          flag: '🇪🇸', dob: '3 Dec 1981' },
  { name: 'Fernando Torres',      nationality: 'Spain',          flag: '🇪🇸', dob: '20 Mar 1984' },
  { name: 'Iker Casillas',        nationality: 'Spain',          flag: '🇪🇸', dob: '20 May 1981' },
  { name: 'Sergio Ramos',         nationality: 'Spain',          flag: '🇪🇸', dob: '30 Mar 1986' },
  { name: 'Carles Puyol',         nationality: 'Spain',          flag: '🇪🇸', dob: '13 Apr 1978' },
  { name: 'Xabi Alonso',          nationality: 'Spain',          flag: '🇪🇸', dob: '25 Nov 1981' },
  { name: 'Fernando Hierro',      nationality: 'Spain',          flag: '🇪🇸', dob: '23 Mar 1968' },
  { name: 'Pedri',                nationality: 'Spain',          flag: '🇪🇸', dob: '25 Nov 2002' },
  { name: 'Gavi',                 nationality: 'Spain',          flag: '🇪🇸', dob: '5 Aug 2004' },
  { name: 'Rodri',                nationality: 'Spain',          flag: '🇪🇸', dob: '22 Jun 1996' },
  { name: 'Alvaro Morata',        nationality: 'Spain',          flag: '🇪🇸', dob: '23 Oct 1992' },
  { name: 'Cesc Fabregas',        nationality: 'Spain',          flag: '🇪🇸', dob: '4 May 1987' },
  { name: 'Emilio Butragueno',    nationality: 'Spain',          flag: '🇪🇸', dob: '22 Jul 1963' },
  { name: 'Michel Salgado',       nationality: 'Spain',          flag: '🇪🇸', dob: '22 Oct 1975' },

  // Sweden
  { name: 'Zlatan Ibrahimovic',   nationality: 'Sweden',         flag: '🇸🇪', dob: '3 Oct 1981' },
  { name: 'Henrik Larsson',       nationality: 'Sweden',         flag: '🇸🇪', dob: '20 Sep 1971' },
  { name: 'Freddie Ljungberg',    nationality: 'Sweden',         flag: '🇸🇪', dob: '16 Apr 1977' },
  { name: 'Tomas Brolin',         nationality: 'Sweden',         flag: '🇸🇪', dob: '29 Nov 1969' },

  // Trinidad
  { name: 'Dwight Yorke',         nationality: 'Trinidad',       flag: '🇹🇹', dob: '3 Nov 1971' },

  // Turkey
  { name: 'Hakan Sukur',          nationality: 'Turkey',         flag: '🇹🇷', dob: '1 Sep 1971' },
  { name: 'Hakan Calhanoglu',     nationality: 'Turkey',         flag: '🇹🇷', dob: '8 Feb 1994' },

  // Ukraine
  { name: 'Andriy Shevchenko',    nationality: 'Ukraine',        flag: '🇺🇦', dob: '29 Sep 1976' },
  { name: 'Andriy Yarmolenko',    nationality: 'Ukraine',        flag: '🇺🇦', dob: '23 Oct 1989' },

  // Uruguay
  { name: 'Luis Suarez',          nationality: 'Uruguay',        flag: '🇺🇾', dob: '24 Jan 1987' },
  { name: 'Diego Forlan',         nationality: 'Uruguay',        flag: '🇺🇾', dob: '19 May 1979' },
  { name: 'Edinson Cavani',       nationality: 'Uruguay',        flag: '🇺🇾', dob: '14 Feb 1987' },

  // Wales
  { name: 'Gareth Bale',          nationality: 'Wales',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dob: '16 Jul 1989' },
  { name: 'Ryan Giggs',           nationality: 'Wales',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dob: '29 Nov 1973' },
  { name: 'Ian Rush',             nationality: 'Wales',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dob: '20 Oct 1961' },
  { name: 'Mark Hughes',          nationality: 'Wales',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dob: '1 Nov 1963' },
  { name: 'Gary Speed',           nationality: 'Wales',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dob: '8 Sep 1969' },

  // Tenable extras — historic players referenced in Football Tenable
  // answer lists that don't show up in TheSportsDB search or the lists above.
  { name: 'Ronaldo',              nationality: 'Brazil',         flag: '🇧🇷', dob: '22 Sep 1976' },
  { name: 'Jairzinho',            nationality: 'Brazil',         flag: '🇧🇷', dob: '25 Dec 1944' },
  { name: 'Tostao',               nationality: 'Brazil',         flag: '🇧🇷', dob: '25 Jan 1947' },
  { name: 'Just Fontaine',        nationality: 'France',         flag: '🇫🇷', dob: '18 Aug 1933' },
  { name: 'Michel Platini',       nationality: 'France',         flag: '🇫🇷', dob: '21 Jun 1955' },
  { name: 'Kevin Keegan',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '14 Feb 1951' },
  { name: 'Jimmy Greaves',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '20 Feb 1940' },
  { name: 'Tom Finney',           nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '5 Apr 1922' },
  { name: 'Nat Lofthouse',        nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '27 Aug 1925' },
  { name: 'Gareth Barry',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '23 Feb 1981' },
  { name: 'David James',          nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '1 Aug 1970' },
  { name: 'Jamie Carragher',      nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '28 Jan 1978' },
  { name: 'Phil Neville',         nationality: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dob: '21 Jan 1977' },
  { name: 'Mark Schwarzer',       nationality: 'Australia',      flag: '🇦🇺', dob: '6 Oct 1972' },
  { name: 'Telmo Zarra',          nationality: 'Spain',          flag: '🇪🇸', dob: '20 Jan 1921' },
  { name: 'Quini',                nationality: 'Spain',          flag: '🇪🇸', dob: '23 Sep 1949' },
  { name: 'Cesar Rodriguez',      nationality: 'Spain',          flag: '🇪🇸', dob: '13 Mar 1920' },
  { name: 'Isidro Langara',       nationality: 'Spain',          flag: '🇪🇸', dob: '10 May 1912' },
  { name: 'Santillana',           nationality: 'Spain',          flag: '🇪🇸', dob: '23 Aug 1952' },
  { name: 'Gento',                nationality: 'Spain',          flag: '🇪🇸', dob: '21 Oct 1933' },
  { name: 'Pirri',                nationality: 'Spain',          flag: '🇪🇸', dob: '11 Mar 1945' },
  { name: 'Amancio',              nationality: 'Spain',          flag: '🇪🇸', dob: '16 Oct 1939' },
]
