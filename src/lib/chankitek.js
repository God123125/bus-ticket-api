!(function (t, e) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
      ? define([], e)
      : "object" == typeof exports
        ? (exports.BuddhistCalendars = e())
        : (t.BuddhistCalendars = e());
})(this, function () {
  return (function (t) {
    var e = {};

    function a(r) {
      if (e[r]) return e[r].exports;
      var n = (e[r] = {
        i: r,
        l: !1,
        exports: {},
      });
      return (t[r].call(n.exports, n, n.exports, a), (n.l = !0), n.exports);
    }
    return (
      (a.m = t),
      (a.c = e),
      (a.d = function (t, e, r) {
        a.o(t, e) ||
          Object.defineProperty(t, e, {
            configurable: !1,
            enumerable: !0,
            get: r,
          });
      }),
      (a.r = function (t) {
        Object.defineProperty(t, "__esModule", {
          value: !0,
        });
      }),
      (a.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default;
              }
            : function () {
                return t;
              };
        return (a.d(e, "a", e), e);
      }),
      (a.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }),
      (a.p = ""),
      a((a.s = 6))
    );
  })([
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = a(1),
        n = a(3),
        i = (function () {
          function t(t) {
            if (
              ((this.year = t),
              (this.currentLunar = new r.LunarUtils(t)),
              (this.nextLunar = new r.LunarUtils(t + 1)),
              (this.previousLunar = new r.LunarUtils(t - 1)),
              (this.isBodetheyLeap =
                this.currentLunar.bodethey > 24 ||
                this.currentLunar.bodethey < 6 ||
                (24 === this.currentLunar.bodethey &&
                  6 === this.nextLunar.bodethey) ||
                (25 === this.currentLunar.bodethey &&
                  5 === this.nextLunar.bodethey)),
              (this.isNormalLeap = this.currentLunar.kromthupul <= 207),
              (this.isProtetinLeap =
                this.isNormalLeap && this.currentLunar.avorman < 127),
              this.isNormalLeap ||
                (137 === this.currentLunar.avorman &&
                0 === this.nextLunar.avorman
                  ? (this.isProtetinLeap = !1)
                  : this.currentLunar.avorman < 138 &&
                    (this.isProtetinLeap = !0)),
              !this.isProtetinLeap)
            ) {
              var e = this.previousLunar.getLeap();
              this.isProtetinLeap = e.isProtetinLeap && e.isBodetheyLeap;
            }
          }
          return (
            (t.getTypesOfYears = function (e, a) {
              var r = {
                normal: 0,
                great: 0,
                bodethey: 0,
              };
              if (e.getFullYear() >= a.getFullYear()) {
                for (var i = a.getFullYear(); i < e.getFullYear() + 1; i++) {
                  (s = new t(n.DateUtils.ceToLunarYear(i))).isBodetheyLeap
                    ? r.bodethey++
                    : s.getGreatLeap()
                      ? r.great++
                      : r.normal++;
                }
                return r;
              }
              for (i = e.getFullYear() + 1; i < a.getFullYear(); i++) {
                var s;
                (s = new t(n.DateUtils.ceToLunarYear(i))).isBodetheyLeap
                  ? r.bodethey++
                  : s.getGreatLeap()
                    ? r.great++
                    : r.normal++;
              }
              return r;
            }),
            (t.prototype.getTotalDays = function () {
              return this.isNormalLeap
                ? 354
                : this.isBodetheyLeap
                  ? 384
                  : this.getGreatLeap()
                    ? 355
                    : 354;
            }),
            (t.prototype.getGreatLeap = function () {
              var t = this.isProtetinLeap;
              return (
                this.isBodetheyLeap && this.isProtetinLeap && (t = !1),
                t
              );
            }),
            t
          );
        })();
      e.LeapUtils = i;
    },
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = a(0),
        n = (function () {
          function t(t) {
            ((this.year = t),
              (this.aharkun = (292207 * this.year + 373) % 800),
              (this.kromthupul = 800 - this.aharkun),
              (this.harkun = Math.floor((292207 * this.year + 373) / 800) + 1),
              (this.avorman = (11 * this.harkun + 650) % 692),
              (this.bodethey =
                (this.harkun + Math.floor((11 * this.harkun + 650) / 692)) %
                30));
          }
          return (
            (t.prototype.getLeap = function () {
              return new r.LeapUtils(this.year);
            }),
            (t.prototype.getLerngSakDay = function () {
              var t = new r.LeapUtils(this.year - 1),
                e = 0;
              return (
                !t.isBodetheyLeap || (t.isBodetheyLeap && !t.isProtetinLeap)
                  ? ((e = 0), this.bodethey < 6 && (e = 1))
                  : t.isBodetheyLeap && t.isProtetinLeap && (e = 1),
                this.bodethey + e
              );
            }),
            (t.prototype.getLerngSakWeekday = function () {
              return this.harkun % 7;
            }),
            (t.prototype.getLerngSak = function () {
              var t = this.getLerngSakDay();
              return t >= 6 && t <= 29
                ? {
                    monthId: 4,
                    day: t > 15 ? t - 15 : t,
                    isWax: t <= 15,
                  }
                : {
                    monthId: 5,
                    day: t,
                    isWax: !0,
                  };
            }),
            (t.prototype.getSak = function () {
              return [
                "ឯកស័ក",
                "ទោស័ក",
                "ត្រីស័ក",
                "ចត្វាស័ក",
                "បញ្ចស័ក",
                "ឆស័ក",
                "សប្តស័ក",
                "អដ្ឋស័ក",
                "នព្វស័ក",
                "សំរិទ្ធិស័ក",
              ];
            }),
            (t.prototype.getZodiac = function () {
              return [
                "ជូត",
                "ឆ្លូវ",
                "ខាល",
                "ថោះ",
                "រោង",
                "ម្សាញ់",
                "មមី",
                "មមែ",
                "វក",
                "រកា",
                "ច",
                "កុរ",
              ];
            }),
            (t.prototype.getLunarDate = function () {
              return [
                "អាទិត្យ",
                "ចន្ទ",
                "អង្គារ",
                "ពុធ",
                "ព្រហស្បតិ៍",
                "សុក្រ",
                "សៅរ៍",
              ];
            }),
            (t.prototype.getSolarMonth = function () {
              return [
                "មករា",
                "កុម្ភៈ",
                "មីនា",
                "មេសា",
                "ឧសភា",
                "មិថុនា",
                "កក្កដា",
                "សីហា",
                "កញ្ញា",
                "តុលា",
                "វិច្ឆិកា",
                "ធ្នូ",
              ];
            }),
            (t.prototype.getLunarMonth = function () {
              var t = this;
              return [
                {
                  id: 0,
                  days: 29,
                  name: "មិគសិរ",
                },
                {
                  id: 1,
                  days: 30,
                  name: "បុស្ស",
                },
                {
                  id: 2,
                  days: 29,
                  name: "មាឃ",
                },
                {
                  id: 3,
                  days: 30,
                  name: "ផល្គុន",
                },
                {
                  id: 4,
                  days: 29,
                  name: "ចេត្រ",
                },
                {
                  id: 5,
                  days: 30,
                  name: "ពិសាខ",
                },
                {
                  id: 6,
                  days: this.getLeap().getGreatLeap() ? 30 : 29,
                  name: "ជេស្ឋ",
                },
                {
                  id: 7,
                  days: 30,
                  name: "អាសាឍ",
                },
                {
                  id: 8,
                  days: 30,
                  name: "បឋមសាឍ",
                },
                {
                  id: 9,
                  days: 30,
                  name: "ទុតិយសាឍ",
                },
                {
                  id: 10,
                  days: 29,
                  name: "ស្រាពណ៍",
                },
                {
                  id: 11,
                  days: 30,
                  name: "ភទ្របទ",
                },
                {
                  id: 12,
                  days: 29,
                  name: "អស្សុជ",
                },
                {
                  id: 13,
                  days: 30,
                  name: "កត្ដិក",
                },
              ].filter(function (e, a) {
                return t.getLeap().isBodetheyLeap
                  ? 7 !== e.id
                  : 8 !== e.id && 9 !== e.id;
              });
            }),
            t
          );
        })();
      e.LunarUtils = n;
    },
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = (function () {
        function t() {}
        return (
          (t.StartingDate = new Date("1970/11/29")),
          (t.lunarWeekdays =
            "សៅរ៍_អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ".split("_")),
          (t.animalYears =
            "ជូត_ឆ្លូវ_ខាល_ថោះ_រោង_ម្សាញ់_មមី_មមែ_វក_រការ_ច_កុរ".split("_")),
          (t.sakCycle = "ឯក_ទោ_ត្រី_ចត្វា_បញ្ច_ឆ_សប្ត_អដ្ឋ_នព្វ_សំរឹទ្ធិ"
            .split("_")
            .map(function (t) {
              return t + "ស័ក";
            })),
          (t.months =
            "មករា_កុម្ភៈ_មីនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ".split(
              "_",
            )),
          t
        );
      })();
      e.Constants = r;
    },
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = (function () {
        function t() {}
        return (
          (t.getDaysRange = function (t, e) {
            return Math.abs(Math.floor((e.getTime() - t.getTime()) / 864e5));
          }),
          (t.ceToLunarYear = function (t) {
            return t - 638;
          }),
          (t.lunarToCE = function (t) {
            return t + 638;
          }),
          t
        );
      })();
      e.DateUtils = r;
    },
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = a(1),
        n = a(2),
        i = a(0),
        s = (function () {
          function t(t) {
            ((this.year = t),
              (this.lunarUtil = new r.LunarUtils(t)),
              (this.leapUtil = new i.LeapUtils(t)),
              (this.prevLeapUtil = new i.LeapUtils(t - 1)));
          }
          return (
            (t.prototype.getNewYearDate = function () {
              var t,
                e = this.getNewYearLength(),
                a = this.getLerngSakDate();
              a.day > e - 1
                ? (t = {
                    day: a.day - (e - 1),
                    monthId: a.monthId,
                    isWax: a.isWax,
                  })
                : (t = {
                    day: 14 + a.day + (a.isWax ? 0 : 1) - (e - 1),
                    monthId: a.monthId - (a.isWax ? 1 : 0),
                    isWax: !a.isWax,
                  });
              return t;
            }),
            (t.prototype.getLerngSakDate = function () {
              return this.lunarUtil.getLerngSak();
            }),
            (t.prototype.getNewYearProperties = function () {
              var t,
                e,
                a,
                r = [362, 363, 364, 365, 366];
              this.prevLeapUtil.isNormalLeap
                ? r.splice(0, 1)
                : r.splice(r.length - 1, 1);
              for (var n = 0; n < r.length; n++) {
                var i = r[n],
                  s = this.getSunInaccurate(i);
                if (0 == s.fortune && 0 == s.angsar) {
                  t = n;
                  var o = 24 * (60 - s.lippda);
                  ((e = Math.floor(o / 60)), (a = o % 60));
                }
              }
              return {
                firstIndex: t,
                hour: e,
                minute: a,
                sotinArray: r,
              };
            }),
            (t.prototype.getNewYearTime = function () {
              var t = this.getNewYearProperties();
              return {
                hour: t.hour,
                minute: t.minute,
              };
            }),
            (t.prototype.getNewYearLength = function () {
              var t = this.getNewYearProperties(),
                e = t.sotinArray,
                a = t.firstIndex;
              return e.length - a;
            }),
            (t.prototype.getWeekday = function () {
              return this.lunarUtil.harkun % 7;
            }),
            (t.prototype.getWeekdayName = function () {
              return n.Constants.lunarWeekdays[this.getWeekday()];
            }),
            (t.prototype.getSunMediant = function (t) {
              var e = new r.LunarUtils(this.year - 1),
                a = Math.floor((e.kromthupul + 800 * t) / 24350),
                n = (e.kromthupul + 800 * t) % 24350,
                i = n % 811;
              return {
                fortune: a,
                angsar: Math.floor(n / 811),
                lippda: Math.floor(i / 14) - 3,
              };
            }),
            (t.prototype.simplifyMediant = function (t) {
              var e = t;
              return (
                e.lippda >= 60 && ((e.lippda -= 60), e.angsar++),
                e.angsar >= 30 && ((e.angsar -= 30), e.fortune++),
                e.fortune >= 12 && (e.fortune -= 12),
                t
              );
            }),
            (t.prototype.getSunInaccurate = function (t) {
              var e = 20,
                a = 2,
                r = 0,
                n = this.getSunMediant(t);
              (n.fortune < a && (n.fortune += 12),
                n.angsar < e && (n.fortune--, (n.angsar += 30)),
                n.lippda < r && (n.angsar--, (n.lippda += 60)));
              var i,
                s = {
                  fortune: n.fortune - a,
                  lippda: n.lippda - r,
                  angsar: n.angsar - e,
                },
                o = s.fortune;
              s.fortune >= 0 && s.fortune <= 2
                ? (i = s)
                : s.fortune >= 3 && s.fortune <= 5
                  ? (i = {
                      angsar: 0 - s.angsar,
                      fortune: 6 - s.fortune,
                      lippda: 0 - s.lippda,
                    })
                  : s.fortune >= 6 && s.fortune <= 8
                    ? (i = {
                        angsar: s.angsar,
                        fortune: s.fortune - 6,
                        lippda: s.lippda,
                      })
                    : s.fortune >= 9 &&
                      s.fortune <= 11 &&
                      (i = {
                        fortune: 11 - s.fortune,
                        angsar: 29 - s.angsar,
                        lippda: 60 - s.lippda,
                      });
              var u,
                h = 2 * i.fortune + (i.angsar >= 15 ? 1 : 0);
              u =
                i.angsar >= 15
                  ? 60 * (i.angsar - 15) + i.lippda
                  : 60 * i.angsar + i.lippda;
              var l,
                p = [
                  {
                    multiplication: 35,
                    chaya: 0,
                  },
                  {
                    multiplication: 32,
                    chaya: 35,
                  },
                  {
                    multiplication: 27,
                    chaya: 67,
                  },
                  {
                    multiplication: 22,
                    chaya: 94,
                  },
                  {
                    multiplication: 13,
                    chaya: 116,
                  },
                  {
                    multiplication: 5,
                    chaya: 129,
                  },
                ][h],
                y = Math.floor((u * p.multiplication) / 900),
                d = (p.multiplication, 0),
                f = Math.floor((y + p.chaya) / 60),
                g = (y + p.chaya) % 60;
              return (
                (l =
                  o <= 5
                    ? {
                        fortune: n.fortune - d,
                        angsar: n.angsar - f,
                        lippda: n.lippda - g,
                      }
                    : {
                        fortune: n.fortune + d,
                        angsar: n.angsar + f,
                        lippda: n.lippda + g,
                      }),
                this.simplifyMediant(l)
              );
            }),
            t
          );
        })();
      e.NewYearUtils = s;
    },
    function (t, e, a) {
      "use strict";
      Object.defineProperty(e, "__esModule", {
        value: !0,
      });
      var r = a(3),
        n = a(1),
        i = a(2),
        s = a(0),
        o = a(4),
        u = (function () {
          function t(t) {
            (void 0 === t && (t = new Date()),
              (this.date = t),
              (this.lunarUtils = new n.LunarUtils(
                r.DateUtils.ceToLunarYear(t.getFullYear()),
              )),
              (this.nextLunarUtils = new n.LunarUtils(
                r.DateUtils.ceToLunarYear(t.getFullYear() + 1),
              )),
              (this.newYearUtils = new o.NewYearUtils(
                r.DateUtils.ceToLunarYear(t.getFullYear()),
              )),
              (this.lunarDay = this.getLunarDay()));
          }
          return (
            (t.prototype.calendars = function () {
              var t = new h();
              return (
                (t.GregorianCalendar = {
                  year: this.date.getFullYear(),
                  month: this.date.getMonth(),
                  monthName:
                    this.lunarUtils.getSolarMonth()[this.date.getMonth()],
                  day: this.date.getDate(),
                  dayName: this.lunarUtils.getLunarDate()[this.date.getDay()],
                  hour: this.date.getHours(),
                  minute: this.date.getMinutes(),
                  second: this.date.getSeconds(),
                }),
                (t.KhmerBuddhistCalendar = {
                  day: this.lunarDay.day,
                  month: this.lunarDay.month.name,
                  year: this.lunarDay.year,
                  dayName: this.lunarUtils.getLunarDate()[this.date.getDay()],
                  moonPhase: "Wax" == this.lunarDay.moonPhase ? "កើត" : "រោច",
                  smallEraYear: this.lunarDay.smallEraYear,
                  greatEraYear: this.lunarDay.smallEraYear + 560,
                  zodiac: this.lunarUtils.getZodiac()[this.getAnimalYear()],
                  sak: this.lunarUtils.getSak()[this.getSak()],
                  worshipDay: this.isWorshipDay(),
                  koarDay: this.isKoarDay(),
                  newYearDay: this.newYearUtils.getNewYearDate(),
                  newYearTime: this.newYearUtils.getNewYearTime(),
                }),
                t
              );
            }),
            (t.prototype.moonPhase = function () {
              return this.lunarDay.moonPhase;
            }),
            (t.prototype.isWorshipDay = function () {
              return (
                8 === this.lunarDay.day ||
                (this.isWax() && 15 === this.lunarDay.day) ||
                (!this.isWax() && 15 === this.lunarDay.day) ||
                (!this.isWax() && 14 === this.lunarDay.day)
              );
            }),
            (t.prototype.isKoarDay = function () {
              return (
                (this.isWax() && 14 == this.lunarDay.day) ||
                (!this.isWax() &&
                  30 == this.lunarDay.month.days &&
                  14 == this.lunarDay.day) ||
                (!this.isWax() &&
                  29 == this.lunarDay.month.days &&
                  13 == this.lunarDay.day)
              );
            }),
            (t.prototype.isWax = function () {
              return "Wax" == this.lunarDay.moonPhase;
            }),
            (t.prototype.getMonthAndDay = function (t, e) {
              for (var a, r = t, n = 0; n < e.length; n++) {
                if (r <= e[0].days) {
                  a = 0;
                  break;
                }
                r -= e[n].days;
                var i = e[n + 1];
                if (i && !(r > i.days)) {
                  a = n + 1;
                  break;
                }
              }
              return {
                month: a,
                day: r,
              };
            }),
            (t.prototype.getSmallEraYear = function (t, e, a) {
              var r = this.lunarUtils.year,
                n = this.newYearUtils.getNewYearDate();
              return (
                n.monthId > e
                  ? (r = this.lunarUtils.year - 1)
                  : n.monthId == e &&
                    (n.isWax && "Wax" == a
                      ? (r =
                          n.day > t
                            ? this.lunarUtils.year - 1
                            : this.lunarUtils.year)
                      : n.isWax ||
                        (r =
                          "Wane" == a
                            ? n.day > t
                              ? this.lunarUtils.year - 1
                              : this.lunarUtils.year
                            : this.lunarUtils.year - 1)),
                r
              );
            }),
            (t.prototype.getDayOfMoonPhase = function (t) {
              return t > 15 ? t - 15 : t;
            }),
            (t.prototype.getBuddhistEraYear = function (t) {
              return this.date.getFullYear() + (t <= 162 ? 543 : 544);
            }),
            (t.prototype.getLunarDay = function () {
              var t,
                e,
                a,
                n,
                o,
                u,
                h = r.DateUtils.getDaysRange(
                  i.Constants.StartingDate,
                  this.date,
                ),
                l = s.LeapUtils.getTypesOfYears(
                  i.Constants.StartingDate,
                  this.date,
                ),
                p =
                  Math.abs(
                    h - (354 * l.normal + 355 * l.great + 384 * l.bodethey),
                  ) + 1,
                y = this.lunarUtils.getLeap(),
                d = this.lunarUtils.getLunarMonth(),
                f = this.nextLunarUtils.getLunarMonth(),
                g = y.getTotalDays();
              p > g
                ? ((n = this.nextLunarUtils.year - 1),
                  (a = d[(u = this.getMonthAndDay(p - g, f)).month]),
                  (t = u.day),
                  (o = this.getMoonPhase(t)),
                  (e = this.getDayOfMoonPhase(t)))
                : ((a = d[(u = this.getMonthAndDay(p, d)).month]),
                  (t = u.day),
                  (o = this.getMoonPhase(t)),
                  (e = this.getDayOfMoonPhase(t)),
                  (n = this.getSmallEraYear(e, a.id, o)));
              return {
                day: e,
                moonPhase: o,
                month: a,
                year: this.getBuddhistEraYear(p),
                smallEraYear: n,
              };
            }),
            (t.prototype.getMoonPhase = function (t) {
              return t <= 15 ? "Wax" : "Wane";
            }),
            (t.prototype.getSak = function () {
              return ((this.lunarDay.smallEraYear % 10) + 9) % 10;
            }),
            (t.prototype.getAnimalYear = function () {
              return ((this.lunarDay.smallEraYear % 12) + 10) % 12;
            }),
            t
          );
        })();
      e.BuddhistCalendars = u;
      var h = (function () {
        return function () {};
      })();
      e.BuddhistCalendar = h;
      var l = a(3);
      e.DateUtils = l.DateUtils;
      var p = a(1);
      e.LunarUtils = p.LunarUtils;
      var y = a(2);
      e.Constants = y.Constants;
      var d = a(0);
      e.LeapUtils = d.LeapUtils;
      var f = a(4);
      e.NewYearUtils = f.NewYearUtils;
    },
    function (t, e, a) {
      "use strict";
      var r = a(5);
      t.exports = r.BuddhistCalendars;
    },
  ]);
});
