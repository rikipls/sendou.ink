import React, { useState, useEffect } from "react"
import {
  Button,
  Form,
  Radio,
  Segment,
  List,
  Image,
  Grid,
  Dropdown
} from "semantic-ui-react"
import WeaponForm from "./WeaponForm"
import useTrends from "../hooks/useTrends"
import useWindowDimensions from "../hooks/useWindowDimensions"
import english_internal from "../../utils/english_internal.json"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush
} from "recharts"

const circleStyle = {
  width: "25px",
  height: "25px",
  WebkitBorderRadius: "12.5px",
  MozBorderRadius: "12.5px",
  borderRadius: "12.5px"
}

const customToolTipStyle = {
  width: "200px",
  margin: "0",
  lineHeight: "24px",
  border: "1px solid #f5f5f5",
  backgroundColor: "hsla(0,0%,100%,.8)",
  padding: "10px"
}

const labelStyle = {
  margin: "0",
  color: "#666",
  fontWeight: "700"
}

const introStyle = {
  borderTop: "1px solid #f5f5f5",
  margin: "0"
}

const descStyle = {
  margin: 0,
  color: "#999"
}

const months = [
  null,
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

const XTrends = ({ setMenuSelection }) => {
  const [weaponForm, setWeaponForm] = useState(null)
  const [combineFormLeft, setCombineFormLeft] = useState(null)
  const [combineFormRight, setCombineFormRight] = useState(null)
  const [weaponForDispatch, setWeaponForDispatch] = useState(null)
  const [mode, setMode] = useState("ALL")
  const [modeForDispatch, setModeForDispatch] = useState(null)
  const { loading, error, plotData, dispatch } = useTrends(
    weaponForDispatch,
    modeForDispatch
  )
  const { containerWidth } = useWindowDimensions()

  useEffect(() => {
    setMenuSelection("trends")
    document.title = "X Rank Trends - sendou.ink"
  }, [setMenuSelection])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      const monthNumber = payload[0].payload.name
      const yearNumber = payload[0].payload.year
      let patchDescription = null
      if (payload[0].payload.hasOwnProperty("patch")) {
        if (monthNumber === 4 && yearNumber === 2019) {
          patchDescription = "Patches 4.6 and 4.7 were released."
        } else {
          patchDescription = `Patch ${payload[0].payload.patch} was released.`
        }
      }
      return (
        <div style={customToolTipStyle}>
          <p style={labelStyle}>{`${months[monthNumber]} (${yearNumber})`}</p>
          {payload.map(p => {
            return (
              <p style={{ ...introStyle, color: p.stroke }} key={p.dataKey}>
                {p.payload[p.dataKey]} - {p.dataKey}
              </p>
            )
          })}
          {patchDescription && <p style={descStyle}>{patchDescription}</p>}
        </div>
      )
    }

    return null
  }

  return (
    <div>
      <Segment>
        <div style={{ padding: "5px" }}>
          <WeaponForm
            showSubSpecials
            weaponForm={weaponForm}
            setWeaponForm={setWeaponForm}
          />
          <div style={{ paddingTop: "10px" }}>
            <Form>
              <Form.Field>
                <Radio
                  label="All Modes"
                  name="radioGroup"
                  value="ALL"
                  checked={mode === "ALL"}
                  onChange={() => setMode("ALL")}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label="Splat Zones"
                  name="radioGroup"
                  value="SZ"
                  checked={mode === "SZ"}
                  onChange={() => setMode("SZ")}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label="Tower Control"
                  name="radioGroup"
                  value="TC"
                  checked={mode === "TC"}
                  onChange={() => setMode("TC")}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label="Rainmaker"
                  name="radioGroup"
                  value="RM"
                  checked={mode === "RM"}
                  onChange={() => setMode("RM")}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label="Clam Blitz"
                  name="radioGroup"
                  value="CB"
                  checked={mode === "CB"}
                  onChange={() => setMode("CB")}
                />
              </Form.Field>
            </Form>
          </div>
          <div style={{ paddingTop: "10px" }}>
            <Button
              loading={loading}
              onClick={() => {
                setWeaponForDispatch(weaponForm)
                setModeForDispatch(mode)
                const wpnForCombine =
                  mode === "ALL" ? weaponForm : `${weaponForm} (${mode})`
                setCombineFormLeft(wpnForCombine)
                if (plotData.keys.length >= 1)
                  setCombineFormRight(
                    plotData.keys[plotData.keys.length - 1].weapon
                  )
              }}
              disabled={!weaponForm}
            >
              Add to plot as new
            </Button>
            {plotData.keys.length >= 2 && (
              <div style={{ paddingTop: "10px" }}>
                <Button
                  disabled={
                    !combineFormLeft ||
                    !combineFormRight ||
                    combineFormLeft === combineFormRight
                  }
                  onClick={() => {
                    dispatch({
                      type: "combine",
                      left: combineFormLeft,
                      right: combineFormRight
                    })
                  }}
                >
                  Combine...
                </Button>
                <span>
                  {" "}
                  <Dropdown
                    inline
                    options={plotData.keys
                      .map(k => {
                        return { text: k.weapon, value: k.weapon }
                      })
                      .filter(k => k.text !== combineFormRight)}
                    onChange={(event, { value }) => {
                      setCombineFormLeft(value)
                    }}
                    value={combineFormLeft}
                  />{" "}
                  with{" "}
                  <Dropdown
                    inline
                    options={plotData.keys
                      .map(k => {
                        return { text: k.weapon, value: k.weapon }
                      })
                      .filter(k => k.text !== combineFormLeft)}
                    onChange={(event, { value }) => {
                      setCombineFormRight(value)
                    }}
                    value={combineFormRight}
                  />
                </span>
              </div>
            )}
          </div>
          {plotData.keys.length > 0 && (
            <div style={{ paddingTop: "10px" }}>
              <LineChart
                width={containerWidth}
                height={500}
                data={plotData.data}
                margin={{
                  top: 5,
                  right: 50,
                  left: 0,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="xLabel" tickLine={false} />
                <XAxis
                  dataKey="patch"
                  tickLine={true}
                  scale="band"
                  axisLine={false}
                  height={1}
                  xAxisId="patch"
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "X rank top 500 placements",
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle"
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" />
                <Brush dataKey="xLabel" height={75} stroke="#000000" />
                {plotData.keys.map(keyObj => {
                  const w = keyObj.weapon
                  const color = keyObj.color
                  return (
                    <Line key={w} type="monotone" dataKey={w} stroke={color} />
                  )
                })}
              </LineChart>
              <Grid columns={2} style={{ paddingTop: "10px" }}>
                <Grid.Column>
                  <List divided verticalAlign="middle">
                    {plotData.keys.map(keyObj => {
                      const w = keyObj.weapon
                      const color = keyObj.color
                      return (
                        <List.Item key={w}>
                          <List.Content floated="right">
                            <Button
                              circular
                              size="mini"
                              negative
                              icon="trash"
                              onClick={() =>
                                dispatch({ type: "delete", weapon: w })
                              }
                            />
                          </List.Content>
                          {w.indexOf("+") === -1 && (
                            <Image
                              avatar
                              src={`/wpnSmall/Wst_${
                                english_internal[
                                  w
                                    .replace(" (SZ)", "")
                                    .replace(" (TC)", "")
                                    .replace(" (RM)", "")
                                    .replace(" (CB)", "")
                                ]
                              }.png`}
                            />
                          )}
                          <List.Content>
                            <span
                              style={{
                                color: color,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                MsUserSelect: "none",
                                userSelect: "none"
                              }}
                              onClick={() =>
                                dispatch({ type: "randomizeColor", weapon: w })
                              }
                            >
                              {w}
                            </span>
                          </List.Content>
                        </List.Item>
                      )
                    })}
                  </List>
                </Grid.Column>
                <Grid.Column />
              </Grid>
            </div>
          )}
        </div>
      </Segment>
    </div>
  )
}

export default XTrends
